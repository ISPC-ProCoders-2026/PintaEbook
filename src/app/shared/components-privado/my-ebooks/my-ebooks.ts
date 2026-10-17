import { ChangeDetectorRef, Component, DestroyRef, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { timeout } from 'rxjs';

import { EbookMetadataResponse } from '../../../models/ebook.model';
import { EbooksService } from '../../../service/ebooks/ebooks';
import { AuthService } from '../../../service/login/login';

export interface EbookSummary {
  ebook_id: string;
  title: string;
  description: string;
  status: string;
  updatedAt: string;
  progress: number;
  coverClass: string;
  coverKicker: string;
}

@Component({
  selector: 'app-my-ebooks',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './my-ebooks.html',
  styleUrl: './my-ebooks.css',
})
export class MyEbooks implements OnInit {
  @Output() openEbook = new EventEmitter<EbookSummary>();
  @Output() createEbook = new EventEmitter<void>();
  @Output() ebookDeleted = new EventEmitter<void>();

  private readonly ebooksService = inject(EbooksService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  searchTerm = '';
  selectedStatus = 'Todos';
  sortBy = 'Última edición';
  ebooks: EbookSummary[] = [];
  isLoading = true;
  loadError = '';
  exportingEbookId: string | null = null;
  exportStartedId: string | null = null;
  exportError: { ebookId: string; message: string } | null = null;
  deletingEbookId: string | null = null;
  deleteError: { ebookId: string; message: string } | null = null;

  ngOnInit(): void {
    this.loadEbooks();
  }

  loadEbooks(): void {
    this.isLoading = true;
    this.loadError = '';

    this.ebooksService.getEbooks()
      .pipe(
        timeout({ first: 15000 }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (items) => {
          this.ebooks = items.map((item) => this.toSummary(item));
          this.isLoading = false;
          this.changeDetector.detectChanges();
        },
        error: () => {
          this.loadError = 'No se pudieron cargar tus E-books. Intentá nuevamente.';
          this.isLoading = false;
          this.changeDetector.detectChanges();
        }
      });
  }

  get filteredEbooks(): EbookSummary[] {
    const searchTerm = this.searchTerm.trim().toLocaleLowerCase();
    const results = this.ebooks.filter((ebook) => {
      const matchesSearch = !searchTerm || [ebook.title, ebook.description]
        .some((value) => value.toLocaleLowerCase().includes(searchTerm));
      const matchesStatus = this.selectedStatus === 'Todos' || ebook.status === this.selectedStatus;
      return matchesSearch && matchesStatus;
    });

    return [...results].sort((first, second) => {
      if (this.sortBy === 'Título') return first.title.localeCompare(second.title);
      if (this.sortBy === 'Progreso') return second.progress - first.progress;
      return 0; // El endpoint ya devuelve los libros ordenados por fecha descendente.
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = 'Todos';
    this.sortBy = 'Última edición';
  }

  exportEpub(ebook: EbookSummary): void {
    if (ebook.status !== 'Finalizado' || this.exportingEbookId) return;
    this.exportingEbookId = ebook.ebook_id;
    this.exportStartedId = null;
    this.exportError = null;
    this.changeDetector.detectChanges();

    this.ebooksService.exportEpub(ebook.ebook_id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ blob, filename }) => {
          const downloadUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = filename;
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
          this.exportingEbookId = null;
          this.exportStartedId = ebook.ebook_id;
          this.changeDetector.detectChanges();
        },
        error: (error: HttpErrorResponse) => {
          this.exportingEbookId = null;
          this.changeDetector.detectChanges();
          if (error.status === 401) {
            this.authService.logout();
            void this.router.navigate(['/login']);
            return;
          }
          this.exportError = { ebookId: ebook.ebook_id, message: this.exportErrorMessage(error.status) };
          this.changeDetector.detectChanges();
        }
      });
  }

  deleteEbook(ebook: EbookSummary): void {
    if (this.deletingEbookId) return;

    this.deletingEbookId = ebook.ebook_id;
    this.deleteError = null;
    this.ebooksService.deleteEbook(ebook.ebook_id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.ebooks = this.ebooks.filter((item) => item.ebook_id !== ebook.ebook_id);
          this.deletingEbookId = null;
          this.ebookDeleted.emit();
          this.changeDetector.detectChanges();
        },
        error: (error: HttpErrorResponse) => {
          this.deletingEbookId = null;
          if (error.status === 401) {
            this.authService.logout();
            void this.router.navigate(['/login']);
            return;
          }
          this.deleteError = { ebookId: ebook.ebook_id, message: this.deleteErrorMessage(error.status) };
          this.changeDetector.detectChanges();
        }
      });
  }

  private deleteErrorMessage(status: number): string {
    if (status === 404) return 'Este ebook ya no existe o no está disponible.';
    if (status === 403) return 'No tenés permiso para eliminar este ebook.';
    return 'No se pudo eliminar el ebook. Revisá tu conexión e intentá nuevamente.';
  }

  private exportErrorMessage(status: number): string {
    switch (status) {
      case 404: return 'No se encontró este e-book o su contenido todavía no está disponible.';
      case 409: return 'Este e-book todavía no está listo para exportar. Esperá a que termine la generación.';
      case 503: return 'No se pudo acceder al contenido ahora. Probá de nuevo más tarde.';
      default: return 'No se pudo exportar el EPUB. Revisá tu conexión e intentá nuevamente.';
    }
  }

  private toSummary(item: EbookMetadataResponse): EbookSummary {
    const status = this.statusLabel(item.status);
    const updatedDate = new Date(item.updated_at);
    const updatedAt = Number.isNaN(updatedDate.getTime())
      ? ''
      : new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(updatedDate);

    return {
      ebook_id: item.ebook_id,
      title: item.title,
      description: item.description,
      status,
      updatedAt,
      progress: item.status === 'COMPLETED' ? 100 : 0,
      coverClass: 'ebook-cover--default',
      coverKicker: 'Tu proyecto'
    };
  }

  private statusLabel(status: EbookMetadataResponse['status']): string {
    switch (status) {
      case 'COMPLETED': return 'Finalizado';
      case 'FAILED': return 'Fallido';
      default: return 'En progreso';
    }
  }
}
