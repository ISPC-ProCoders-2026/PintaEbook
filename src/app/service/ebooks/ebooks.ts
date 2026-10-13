import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  EMPTY,
  forkJoin,
  Observable,
  Subject,
  Subscription,
  switchMap,
  takeUntil,
  timer
} from 'rxjs';
import { catchError, expand, map, reduce } from 'rxjs/operators';

import {
  Chapter,
  EbookContent,
  EbookGenerationRequest,
  EbookGenerationResponse,
  EbookMetadataResponse,
  PaginatedEbookMetadataResponse,
  EbookStatusResponse,
  GenerationProgress,
  CreditBalanceResponse,
  Section,
  AiGeneratePayload,
  AiGenerateResponse
} from '../../models/ebook.model';
import { environment } from '../../../environments/environment.generated';
import { AuthService } from '../login/login';

interface ProgressSocketMessage {
  type: 'progress_update';
  step: number;
  progress?: number;
  message?: string;
  status?: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  error?: string;
  credits_available?: number;
}

@Injectable({ providedIn: 'root' })
export class EbooksService {
  private readonly apiUrl = `${environment.apiBaseUrl}/ebooks/`;

  constructor(private readonly http: HttpClient, private readonly authService: AuthService) {}

  /**
   * Inicia la generación. El backend actual conserva los nombres históricos
   * prompt_idea y quantity_chapters, por eso se traducen desde el contrato del UI.
   */
  generateEbook(payload: EbookGenerationRequest): Observable<{ ebook_id: string }> {
    const backendPayload = {
      title: payload.title,
      description: payload.description,
      prompt_idea: payload.prompt,
      quantity_chapters: payload.num_chapters
    };

    return this.http
      .post<EbookGenerationResponse>(this.apiUrl, backendPayload, {
        headers: this.authHeaders()
      })
      .pipe(map((response) => {
        if (typeof response?.ebook_id !== 'string' || !response.ebook_id.trim()) {
          throw new Error('La API no devolvió un identificador válido para el E-book.');
        }
        return { ebook_id: response.ebook_id };
      }));
  }

  getCreditBalance(): Observable<CreditBalanceResponse> {
    return this.http.get<CreditBalanceResponse>(`${environment.apiBaseUrl}/billing/balance/`, {
      headers: this.authHeaders()
    });
  }

  generateSection(payload: AiGeneratePayload): Observable<AiGenerateResponse> {
    return this.http.post<AiGenerateResponse>(`${environment.apiBaseUrl}/ai/generate/`, payload, {
      headers: this.authHeaders()
    });
  }

  /** Lista los metadatos reales del usuario desde el endpoint REST configurado. */
  getEbooks(): Observable<EbookMetadataResponse[]> {
    return this.getEbookPage(this.apiUrl).pipe(
      expand((page) => page.next ? this.getEbookPage(page.next) : EMPTY),
      reduce((allItems, page) => allItems.concat(page.items), [] as EbookMetadataResponse[])
    );
  }

  private getEbookPage(url: string): Observable<{ items: EbookMetadataResponse[]; next: string | null }> {
    return this.http
      .get<EbookMetadataResponse[] | PaginatedEbookMetadataResponse>(url, {
        headers: this.authHeaders()
      })
      .pipe(map((response) => {
        if (Array.isArray(response)) return { items: response, next: null };
        if (response && Array.isArray(response.results)) {
          return { items: response.results, next: response.next };
        }
        throw new Error('La API devolvió un formato de biblioteca inválido.');
      }));
  }  /** Recibe avances por WebSocket y consulta el estado REST como respaldo. */
  watchGenerationProgress(ebookId: string): Observable<GenerationProgress> {
    return new Observable<GenerationProgress>((subscriber) => {
      let socket: WebSocket | undefined;
      let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
      let pollingSubscription: Subscription | undefined;
      let reconnectAttempts = 0;
      let statusReadFailures = 0;
      let lastProgress = 0;
      let finished = false;
      const stopPolling$ = new Subject<void>();

      const closeSocket = (): void => {
        if (socket && socket.readyState < WebSocket.CLOSING) {
          socket.close(1000, 'Generation stream closed');
        }
      };

      const finish = (progress: GenerationProgress): void => {
        if (finished) return;
        finished = true;
        lastProgress = this.clampProgress(progress.progress);
        subscriber.next({ ...progress, progress: lastProgress, ebook_id: ebookId });
        subscriber.complete();
        if (reconnectTimer) clearTimeout(reconnectTimer);
        stopPolling$.next();
        stopPolling$.complete();
        pollingSubscription?.unsubscribe();
        closeSocket();
      };

      const emitProgress = (message: ProgressSocketMessage): void => {
        const status = message.status;
        const currentProgress = this.clampProgress(message.progress ?? lastProgress);
        lastProgress = Math.max(lastProgress, currentProgress);

        if (status === 'FAILED') {
          const userMessage = 'La generación falló en el servidor. El libro no pudo completarse; intentá más tarde o contactá al equipo técnico.';
          finish({
            progress: lastProgress,
            status_message: userMessage,
            completed: true,
            error: userMessage,
            status: 'FAILED',
            credits_available: message.credits_available
          });
          return;
        }

        if (status === 'COMPLETED') {
          finish({
            progress: 100,
            status_message: message.message ?? '¡Obra finalizada con éxito!',
            completed: true,
            status: 'COMPLETED',
            credits_available: message.credits_available
          });
          return;
        }

        subscriber.next({
          progress: lastProgress,
          status_message: message.message ?? 'Generando capítulos...',
          completed: false,
          ebook_id: ebookId,
          status: 'PROCESSING',
          step: message.step,
          credits_available: message.credits_available
        });
      };

      const connect = (): void => {
        if (finished) return;
        subscriber.next({
          progress: lastProgress,
          status_message: reconnectAttempts ? 'Reconectando con el progreso...' : 'Conectando...',
          completed: false,
          ebook_id: ebookId
        });

        try {
          socket = new WebSocket(this.progressSocketUrl(ebookId));
        } catch {
          scheduleReconnect();
          return;
        }
        const currentSocket = socket;

        currentSocket.onopen = () => {
          if (finished || socket !== currentSocket) return;
          subscriber.next({
            progress: lastProgress,
            status_message: 'Conectado. Esperando el avance de la generación...',
            completed: false,
            ebook_id: ebookId
          });
        };

        currentSocket.onmessage = (event: MessageEvent<string>) => {
          if (finished || socket !== currentSocket) return;
          try {
            const parsed: unknown = JSON.parse(event.data);
            if (this.isProgressMessage(parsed)) emitProgress(parsed);
          } catch {
            // Ignorar mensajes malformados sin inferir un estado.
          }
        };

        currentSocket.onerror = () => currentSocket.close();
        currentSocket.onclose = (event: CloseEvent) => {
          if (finished || socket !== currentSocket) return;
          if ([4001, 4003, 1011].includes(event.code)) {
            const error = new Error(`WebSocket cerrado con código ${event.code}`) as Error & { code: number };
            error.code = event.code;
            subscriber.error(error);
            return;
          }
          if (!finished && socket === currentSocket) scheduleReconnect();
        };
      };

      const scheduleReconnect = (): void => {
        if (finished || reconnectTimer) return;
        reconnectAttempts += 1;
        if (reconnectAttempts > 6) {
          subscriber.next({
            progress: lastProgress,
            status_message: 'Sin conexión WebSocket; consultando el estado del libro...',
            completed: false,
            ebook_id: ebookId
          });
          return;
        }
        const delay = Math.min(1000 * 2 ** (reconnectAttempts - 1), 10000);
        reconnectTimer = setTimeout(() => {
          reconnectTimer = undefined;
          connect();
        }, delay);
      };

      pollingSubscription = timer(1500, 3000)
        .pipe(
          switchMap(() => this.getEbookStatus(ebookId).pipe(catchError(() => {
            statusReadFailures += 1;
            if (reconnectAttempts > 6 && statusReadFailures >= 3 && !finished) {
              subscriber.error(new Error('No se pudo confirmar el estado del E-book.'));
            }
            return EMPTY;
          }))),
          takeUntil(stopPolling$)
        )
        .subscribe({
          next: (status) => {
            statusReadFailures = 0;
            if (status.status === 'COMPLETED') {
              finish({
                progress: 100,
                status_message: '¡Obra finalizada con éxito!',
                completed: true,
                status: 'COMPLETED'
              });
            } else if (status.status === 'FAILED') {
              finish({
                progress: lastProgress,
                status_message: 'No se pudo generar el E-book.',
                completed: true,
                status: 'FAILED',
                error: 'La generación falló. Revisá el estado del libro e intentá nuevamente.'
              });
            }
          },
          error: () => undefined
        });

      // El polling se completa junto al WebSocket o al destruir la vista.
      connect();

      return () => {
        finished = true;
        if (reconnectTimer) clearTimeout(reconnectTimer);
        pollingSubscription?.unsubscribe();
        stopPolling$.next();
        stopPolling$.complete();
        closeSocket();
      };
    });
  }

  getEbookContent(ebookId: string): Observable<EbookContent> {
    return forkJoin({
      content: this.http.get<unknown>(`${this.apiUrl}${encodeURIComponent(ebookId)}/content/`, {
        headers: this.authHeaders()
      }),
      metadata: this.getEbookStatus(ebookId)
    }).pipe(
      map(({ content, metadata }) => {
        if (!this.isRecord(content)) throw new Error('La respuesta del servidor no es un libro válido.');
        return this.normalizeContent({ ...content, title: metadata.title }, ebookId);
      })
    );
  }

  private getEbookStatus(ebookId: string): Observable<EbookStatusResponse> {
    return this.http.get<EbookStatusResponse>(`${this.apiUrl}${encodeURIComponent(ebookId)}/`, {
      headers: this.authHeaders()
    });
  }

  private authHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  private progressSocketUrl(ebookId: string): string {
    const apiUrl = new URL(environment.apiBaseUrl);
    apiUrl.protocol = apiUrl.protocol === 'https:' ? 'wss:' : 'ws:';
    apiUrl.pathname = `${apiUrl.pathname.replace(/\/api\/?$/, '')}/ws/ebooks/${encodeURIComponent(ebookId)}/progress/`;
    const token = this.authService.getToken();
    if (token) apiUrl.searchParams.set('token', token);
    return apiUrl.toString();
  }

  private isProgressMessage(value: unknown): value is ProgressSocketMessage {
    if (!this.isRecord(value) || value['type'] !== 'progress_update') return false;
    if (typeof value['step'] !== 'number' || !Number.isFinite(value['step'])) return false;
    if (typeof value['progress'] !== 'number' || !Number.isFinite(value['progress'])) return false;
    if (typeof value['message'] !== 'string') return false;
    const status = value['status'];
    if (status !== undefined && status !== 'PROCESSING' && status !== 'COMPLETED' && status !== 'FAILED') return false;
    if (value['error'] !== undefined && typeof value['error'] !== 'string') return false;
    if (value['credits_available'] !== undefined && (typeof value['credits_available'] !== 'number' || !Number.isFinite(value['credits_available']))) return false;
    return true;
  }

  private clampProgress(progress: number): number {
    return Math.max(0, Math.min(100, Math.round(progress)));
  }

  private normalizeContent(value: unknown, requestedId: string): EbookContent {
    if (!this.isRecord(value)) throw new Error('La respuesta del servidor no es un libro válido.');

    const rawChapters = value['chapters'];
    if (!Array.isArray(rawChapters)) throw new Error('El libro no contiene una lista de capítulos.');

    const chapters: Chapter[] = rawChapters.map((rawChapter, chapterIndex) => {
      if (!this.isRecord(rawChapter)) throw new Error('El capítulo recibido tiene un formato inválido.');
      const rawChapterId = rawChapter['id'] ?? rawChapter['chapter_id'];
      const chapterId = typeof rawChapter['chapter_id'] === 'number'
        ? rawChapter['chapter_id']
        : chapterIndex + 1;
      const chapterContentId = typeof rawChapterId === 'string' ? rawChapterId : String(chapterId);
      if (typeof rawChapter['title'] !== 'string' || !rawChapter['title'].trim()) {
        throw new Error(`El capítulo ${chapterId} no tiene un título válido.`);
      }
      const rawSections = rawChapter['sections'];
      if (!Array.isArray(rawSections)) throw new Error(`El capítulo ${chapterId} no contiene secciones.`);

      const sections: Section[] = rawSections.map((rawSection, sectionIndex) => {
        if (!this.isRecord(rawSection)) throw new Error('La sección recibida tiene un formato inválido.');
        const requestedSectionId = rawSection['section_id'];
        const rawSectionId = rawSection['id'] ?? requestedSectionId;
        const sectionId = typeof requestedSectionId === 'string' && /^\d+\.\d+$/.test(requestedSectionId)
          ? requestedSectionId
          : `${chapterId}.${sectionIndex + 1}`;
        const sectionContentId = typeof rawSectionId === 'string' ? rawSectionId : sectionId;
        const html = rawSection['content_html'] ?? rawSection['html'];
        if (typeof rawSection['title'] !== 'string' || !rawSection['title'].trim()) {
          throw new Error(`La sección ${sectionId} no tiene un título válido.`);
        }
        if (typeof html !== 'string') {
          throw new Error(`La sección ${sectionId} no contiene HTML válido.`);
        }

        return {
          section_id: sectionId,
          content_id: sectionContentId,
          title: rawSection['title'],
          content_html: html
        };
      });

      return {
        chapter_id: chapterId,
        content_id: chapterContentId,
        title: rawChapter['title'],
        sections
      };
    });

    if (!chapters.length) throw new Error('El libro no contiene capítulos.');
    if (typeof value['title'] !== 'string' || !value['title'].trim()) {
      throw new Error('El libro no tiene un título válido.');
    }

    return {
      ebook_id: typeof value['ebook_id'] === 'string' ? value['ebook_id'] : requestedId,
      title: value['title'],
      chapters
    };
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}
