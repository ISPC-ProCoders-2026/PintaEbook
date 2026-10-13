import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-static-ebook-editor',
  standalone: true,
  templateUrl: './static-ebook-editor.html',
  styleUrl: './static-ebook-editor.css'
})
export class StaticEbookEditor {
  @Output() backToLibrary = new EventEmitter<void>();
}
