import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { EbookContent, EbookMetadataResponse, Section } from '../../../models/ebook.model';
import { EbooksService } from '../../../service/ebooks/ebooks';
import { EbookSummary } from '../my-ebooks/my-ebooks';

@Component({
  selector: 'app-static-ebook-editor',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './static-ebook-editor.html',
  styleUrl: './static-ebook-editor.css'
})
export class StaticEbookEditor implements OnChanges {
  @Input() ebook: EbookSummary | null = null;
  @Output() backToLibrary = new EventEmitter<void>();

  private readonly ebooksService = inject(EbooksService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  metadata: EbookMetadataResponse | null = null;
  content: EbookContent | null = null;
  selectedSection: Section | null = null;
  selectedChapterId = '';
  title = '';
  description = '';
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  saveMessage = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ebook'] && this.ebook) this.loadEbook(this.ebook.ebook_id);
  }

  loadEbook(ebookId: string): void {
    this.isLoading = true;
    this.metadata = null;
    this.content = null;
    this.selectedSection = null;
    this.errorMessage = '';
    this.saveMessage = '';
    forkJoin({ metadata: this.ebooksService.getEbook(ebookId), content: this.ebooksService.getEbookContent(ebookId) }).subscribe({
      next: ({ metadata, content }) => {
        this.metadata = metadata;
        this.content = content;
        this.title = metadata.title;
        this.description = metadata.description ?? '';
        const chapter = content.chapters[0];
        this.selectedChapterId = chapter?.content_id ?? '';
        this.selectedSection = chapter?.sections[0] ?? null;
        this.isLoading = false;
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'No pudimos cargar este E-book. Revisá tu conexión e intentá nuevamente.';
        this.changeDetector.markForCheck();
      }
    });
  }

  selectSection(chapterId: string, section: Section): void {
    this.selectedChapterId = chapterId;
    this.selectedSection = section;
    this.saveMessage = '';
  }

  saveChanges(): void {
    if (!this.ebook || !this.content || this.isSaving) return;
    const title = this.title.trim();
    if (!title) {
      this.errorMessage = 'El título es obligatorio.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.saveMessage = '';
    const sections = this.content.chapters.flatMap((chapter) => chapter.sections.map((section) => ({
      chapter_id: chapter.content_id,
      section_id: section.content_id,
      html: section.content_html
    })));

    forkJoin({
      metadata: this.ebooksService.updateEbookMetadata(this.ebook.ebook_id, { title, description: this.description.trim() }),
      content: this.ebooksService.updateEbookContent(this.ebook.ebook_id, { sections })
    }).subscribe({
      next: ({ metadata }) => {
        this.metadata = metadata;
        this.isSaving = false;
        this.saveMessage = 'Cambios guardados correctamente.';
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.isSaving = false;
        this.errorMessage = 'No se pudieron guardar todos los cambios. Intentá nuevamente.';
        this.changeDetector.markForCheck();
      }
    });
  }

  updateSectionHtml(html: string): void {
    if (!this.content || !this.selectedSection) return;
    this.selectedSection.content_html = html;
    this.saveMessage = '';
  }

  get sectionCount(): number {
    return this.content?.chapters.reduce((total, chapter) => total + chapter.sections.length, 0) ?? 0;
  }
}
