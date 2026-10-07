import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { EbookSummary } from '../my-ebooks/my-ebooks';
import { BookLoader } from '../book-loader/book-loader';
import { EbooksService } from '../../../service/ebooks/ebooks';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Quote from '@editorjs/quote';

@Component({
  selector: 'app-new-ebook',
  standalone: true,
  imports: [ReactiveFormsModule, BookLoader],
  templateUrl: './new-ebook.html',
  styleUrl: './new-ebook.css'
})
export class NewEbook implements AfterViewInit, OnDestroy {
  @Input() existingEbook: EbookSummary | null = null;
  private readonly formBuilder = inject(FormBuilder);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly ebooksService = inject(EbooksService);
  private editor?: EditorJS;
  readonly setupForm = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(120)]],
    description: ['', [Validators.required, Validators.maxLength(500)]],
    promptIdea: ['', [Validators.required, Validators.maxLength(1000)]],
    quantityChapters: [3, [Validators.required, Validators.min(1), Validators.max(10)]],
    genre: ['Ficción literaria', Validators.required],
    contentType: ['Novela', Validators.required]
  });
  showEditor = false;
  isLoading = false;
  loadingMessage = 'Estamos preparando tu espacio de escritura...';
  saveMessage = '';
  formError = '';
  wordCount = 0;

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
    if (this.setupForm.invalid) {
      this.setupForm.markAllAsTouched();
      return;
    }

    this.formError = '';
    this.isLoading = true;
    this.loadingMessage = 'Estamos creando tu E-book...';

    const { title, description, promptIdea, quantityChapters, genre, contentType } = this.setupForm.getRawValue();
    this.ebooksService.createEbook({
      title,
      description,
      prompt_idea: `${promptIdea}\nGénero: ${genre}. Tipo de contenido: ${contentType}.`,
      quantity_chapters: quantityChapters
    }).subscribe({
      next: () => {
        this.showEditor = true;
        this.isLoading = false;
        this.changeDetector.detectChanges();
        window.setTimeout(() => this.initializeEditor(), 0);
      },
      error: (error: { error?: { detail?: string }; message?: string }) => {
        this.isLoading = false;
        this.formError = error.error?.detail ?? error.message ?? 'No se pudo crear el E-book. Intentá nuevamente.';
      }
    });
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
