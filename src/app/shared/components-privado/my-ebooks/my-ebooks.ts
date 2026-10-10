import { Component, DestroyRef, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { timeout } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { EbookMetadataResponse } from '../../../models/ebook.model';
import { EbooksService } from '../../../service/ebooks/ebooks';

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

  private readonly ebooksService = inject(EbooksService);
  private readonly destroyRef = inject(DestroyRef);

  searchTerm = '';
  selectedStatus = 'Todos';
  sortBy = 'Última edición';
  ebooks: EbookSummary[] = [];
  isLoading = true;
  loadError = '';

  ngOnInit(): void {
    this.loadEbooks();
  }

  loadEbooks(): void {
    this.isLoading = true;
    this.loadError = '';

    this.ebooksService.getEbooks()
      .pipe(
        timeout({ first: 15000 }),
        finalize(() => this.isLoading = false),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (items) => {
          this.ebooks = items.map((item) => this.toSummary(item));
        },
        error: () => {
          this.loadError = 'No se pudieron cargar tus E-books. Intentá nuevamente.';
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
