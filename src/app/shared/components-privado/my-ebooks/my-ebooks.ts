import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-my-ebooks',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './my-ebooks.html',
  styleUrl: './my-ebooks.css',
})
export class MyEbooks {
  // Maqueta local: esta bandera permite previsualizar el estado vacío sin lógica de datos.
  readonly displayEmptyState = false;

  searchTerm = '';
  selectedStatus = 'Todos';
  sortBy = 'Última edición';

  readonly ebooks = [
    {
      title: 'La casa de las memorias',
      description: 'Novela contemporánea · Capítulo 06',
      status: 'En progreso',
      updatedAt: 'Editado hace 2 horas',
      progress: 62,
      coverClass: 'ebook-cover--memories',
      coverKicker: 'Una novela',
    },
    {
      title: 'Entre páginas',
      description: 'Relatos breves · 8 capítulos',
      status: 'Borrador',
      updatedAt: 'Editado ayer',
      progress: 34,
      coverClass: 'ebook-cover--pages',
      coverKicker: 'Colección de relatos',
    },
    {
      title: 'Historias de invierno',
      description: 'Ficción literaria · Revisión final',
      status: 'Finalizado',
      updatedAt: 'Editado el 12 de agosto',
      progress: 100,
      coverClass: 'ebook-cover--winter',
      coverKicker: 'Edición especial',
    },
  ];

  get filteredEbooks() {
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
      return this.ebooks.indexOf(first) - this.ebooks.indexOf(second);
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = 'Todos';
    this.sortBy = 'Última edición';
  }
}
