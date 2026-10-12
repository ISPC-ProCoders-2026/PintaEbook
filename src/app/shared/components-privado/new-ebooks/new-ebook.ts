import { AfterViewInit, ChangeDetectorRef, Component, DestroyRef, EventEmitter, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { EbookSummary } from '../my-ebooks/my-ebooks';
import { EbooksService } from '../../../service/ebooks/ebooks';
import { EbookContent, GenerationProgress } from '../../../models/ebook.model';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Quote from '@editorjs/quote';

@Component({
  selector: 'app-new-ebook',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './new-ebook.html',
  styleUrl: './new-ebook.css'
})
export class NewEbook implements AfterViewInit, OnDestroy, OnInit {
  @Input() existingEbook: EbookSummary | null = null;
  @Output() generationSucceeded = new EventEmitter<void>();
  private readonly formBuilder = inject(FormBuilder);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ebooksService = inject(EbooksService);
  private readonly router = inject(Router);
  private editor?: EditorJS;
  readonly setupForm = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(255)]],
    description: [''],
    prompt: [''],
    num_chapters: [3, [Validators.required, Validators.pattern(/^\d+$/), Validators.min(1), Validators.max(10)]],
    genre: ['Ficción literaria', Validators.required],
    contentType: ['Novela', Validators.required]
  });
  showEditor = false;
  isLoading = false;
  saveMessage = '';
  formError = '';
  wordCount = 0;
  showProgressModal = false;
  generatedEbook: EbookContent | null = null;
  isPreviewLoading = false;
  previewError = '';
  creditsAvailable: number | null = null;
  readonly fieldErrors: Record<string, string> = {};
  generationProgress: GenerationProgress = {
    progress: 0,
    status_message: 'Conectando...',
    completed: false
  };

  ngOnInit(): void {
    if (this.existingEbook) return;
    this.ebooksService.getCreditBalance().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (balance) => {
        if (Number.isFinite(balance.credits_available)) this.creditsAvailable = balance.credits_available;
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.existingEbook) {
      this.setupForm.patchValue({
        title: this.existingEbook.title,
        description: this.existingEbook.description
      });
      this.showEditor = true;
    }
    if (!this.showEditor) return;
    this.initializeEditor();
  }

  startEbook(): void {
    if (this.isLoading) return;
    if (this.setupForm.invalid) {
      this.setupForm.markAllAsTouched();
      return;
    }

    this.formError = '';
    Object.keys(this.fieldErrors).forEach((key) => delete this.fieldErrors[key]);
    this.generatedEbook = null;
    this.previewError = '';
    this.isLoading = true;
    this.showProgressModal = true;
    this.generationProgress = {
      progress: 0,
      status_message: 'Conectando...',
      completed: false
    };

    const { title, description, prompt, num_chapters, genre, contentType } = this.setupForm.getRawValue();
    const promptWithContext = prompt.trim()
      ? `${prompt.trim()}\n\nGénero: ${genre}. Tipo de contenido: ${contentType}.`
      : '';

    this.ebooksService.generateEbook({
      title: title.trim(),
      description: description.trim(),
      prompt: promptWithContext,
      num_chapters
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ ebook_id }) => {
        this.generationProgress = {
          progress: 0,
          status_message: 'Solicitud recibida. Iniciando la generación...',
          completed: false,
          ebook_id
        };
        this.ebooksService.watchGenerationProgress(ebook_id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (progress) => this.handleProgress(progress),
            error: (error: Error & { code?: number }) => this.failGeneration(this.progressConnectionMessage(error))
          });
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.showProgressModal = false;
        this.showHttpError(error);
      }
    });
  }

  closeProgressModal(): void {
    if (!this.generationProgress.completed) return;
    this.showProgressModal = false;
    this.isLoading = false;
  }

  private handleProgress(progress: GenerationProgress): void {
    this.generationProgress = progress;
    if (progress.credits_available !== undefined) this.creditsAvailable = progress.credits_available;
    this.changeDetector.markForCheck();

    if (progress.error) {
      if (progress.credits_available === undefined && progress.status === 'FAILED') this.refreshCreditBalance();
      this.failGeneration(progress.error);
      return;
    }

    if (progress.status === 'COMPLETED' && progress.ebook_id) {
      this.isLoading = false;
      this.showProgressModal = false;
      if (progress.credits_available === undefined) this.refreshCreditBalance();
      this.generationSucceeded.emit();
      this.loadGeneratedEbook(progress.ebook_id);
    }
  }

  private showHttpError(error: HttpErrorResponse): void {
    const body = error.error as Record<string, unknown> | null;
    if (error.status === 401) {
      this.formError = 'Tu sesión expiró. Iniciá sesión nuevamente para crear el E-book.';
      void this.router.navigate(['/login']);
      return;
    }
    if (error.status === 402) {
      this.formError = this.apiMessage(body) ?? 'No tenés créditos suficientes para generar este E-book.';
      return;
    }
    if (error.status === 403) {
      this.formError = 'No tenés autorización para realizar esta operación.';
      return;
    }
    if (error.status === 400 && body) {
      for (const [key, value] of Object.entries(body)) {
        const message = Array.isArray(value) ? value.join(' ') : typeof value === 'string' ? value : '';
        const controlName = key === 'prompt_idea' ? 'prompt'
          : key === 'quantity_chapters' ? 'num_chapters' : key;
        if (message && controlName in this.setupForm.controls) {
          this.fieldErrors[controlName] = message;
          this.setupForm.controls[controlName as keyof typeof this.setupForm.controls].setErrors({ backend: true });
        } else if (message) this.formError = [this.formError, message].filter(Boolean).join(' ');
      }
      if (!this.formError && !Object.keys(this.fieldErrors).length) this.formError = 'Revisá los datos del formulario e intentá nuevamente.';
      return;
    }
    this.formError = error.status >= 500
      ? 'El servidor no pudo iniciar la generación. Intentá nuevamente más tarde.'
      : this.apiMessage(body) ?? 'No se pudo crear el E-book. Revisá tu conexión e intentá nuevamente.';
  }

  private apiMessage(body: Record<string, unknown> | null): string | null {
    if (!body) return null;
    const detail = body['detail'];
    return typeof detail === 'string' ? detail : null;
  }

  private refreshCreditBalance(): void {
    this.ebooksService.getCreditBalance().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (balance) => {
        if (Number.isFinite(balance.credits_available)) this.creditsAvailable = balance.credits_available;
        this.changeDetector.markForCheck();
      }
    });
  }

  private progressConnectionMessage(error: Error & { code?: number }): string {
    if (error.code === 4001) {
      void this.router.navigate(['/login']);
      return 'La sesión venció durante el seguimiento. Iniciá sesión para consultar el estado de la generación.';
    }
    if (error.code === 4003) return 'No tenés autorización para consultar el progreso de este E-book.';
    if (error.code === 1011) return 'El servidor interrumpió el seguimiento. No pudimos confirmar si la generación terminó.';
    return 'No pudimos confirmar el estado de la generación. El libro ya fue creado; no lo vuelvas a enviar para evitar duplicarlo.';
  }

  private loadGeneratedEbook(ebookId: string): void {
    this.isPreviewLoading = true;
    this.previewError = '';

    this.ebooksService.getEbookContent(ebookId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (ebook) => {
          this.generatedEbook = ebook;
          this.isPreviewLoading = false;
          this.changeDetector.markForCheck();
        },
        error: () => {
          this.previewError = 'El E-book se creó, pero no pudimos cargar la vista previa. Podés volver a intentarlo desde Mis E-books.';
          this.isPreviewLoading = false;
          this.changeDetector.markForCheck();
        }
      });
  }

  private failGeneration(message: string): void {
    this.isLoading = false;
    this.formError = message;
    this.generationProgress = {
      ...this.generationProgress,
      completed: true,
      error: message,
      status_message: message
    };
    this.changeDetector.markForCheck();
  }

  private initializeEditor(): void {
    if (this.editor) return;
    if (!document.getElementById('ebook-editor')) {
      window.setTimeout(() => this.initializeEditor(), 0);
      return;
    }

    const { title, description } = this.setupForm.getRawValue();
    this.editor = new EditorJS({
      holder: 'ebook-editor',
      placeholder: 'Comienza a escribir tu historia aquí...',
      autofocus: false,
      tools: {
        header: {
          class: Header,
          config: {
            levels: [1, 2, 3],
            defaultLevel: 2
          }
        },
        list: {
          class: List,
          inlineToolbar: true
        },
        quote: {
          class: Quote,
          inlineToolbar: true
        }
      },
      data: {
        blocks: [
          {
            type: 'header',
            data: {
              text: title,
              level: 1
            }
          },
          {
            type: 'paragraph',
            data: {
              text: description
            }
          },
          {
            type: 'paragraph',
            data: {
              text: 'Comenzá a desarrollar tu idea en este espacio. Podés editar este texto y agregar nuevos bloques al manuscrito.'
            }
          }
        ]
      },
      onChange: () => {
        void this.updateWordCount();
      }
    });

    void this.editor.isReady.then(() => this.updateWordCount());
  }

  async saveDraft(): Promise<void> {
    if (!this.editor) return;

    await this.editor.isReady;
    await this.editor.save();
    this.saveMessage = 'Borrador guardado localmente';
    window.setTimeout(() => this.saveMessage = '', 2500);
  }

  async publishEbook(): Promise<void> {
    if (!this.editor) return;

    await this.editor.isReady;
    await this.editor.save();
    this.saveMessage = 'E-book preparado para publicar';
    window.setTimeout(() => this.saveMessage = '', 2500);
  }

  private async updateWordCount(): Promise<void> {
    if (!this.editor) return;

    await this.editor.isReady;
    const output = await this.editor.save();
    this.wordCount = output.blocks.reduce((total: number, block: { data: { text?: unknown } }) => {
      const text = String((block.data as { text?: string }).text ?? '')
        .replace(/<[^>]*>/g, ' ')
        .trim();
      return total + (text ? text.split(/\s+/).length : 0);
    }, 0);
  }

  ngOnDestroy(): void {
    if (this.editor) {
      void this.editor.isReady
        .then(() => this.editor?.destroy())
        .catch(() => undefined);
    }
  }
}
