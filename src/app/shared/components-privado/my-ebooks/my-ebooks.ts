import { Component } from '@angular/core';

@Component({
  selector: 'app-my-ebooks',
  standalone: true,
  templateUrl: './my-ebooks.html',
  styleUrl: './my-ebooks.css',
})
export class MyEbooks {
  // Maqueta local: esta bandera permite previsualizar el estado vacío sin lógica de datos.
  readonly displayEmptyState = false;

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
}
