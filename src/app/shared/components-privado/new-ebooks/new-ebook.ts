import { AfterViewInit, ChangeDetectorRef, Component, DestroyRef, EventEmitter, Input, OnDestroy, Output, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
export class NewEbook implements AfterViewInit, OnDestroy {
  @Input() existingEbook: EbookSummary | null = null;
  @Output() generationSucceeded = new EventEmitter<void>();
  private readonly formBuilder = inject(FormBuilder);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ebooksService = inject(EbooksService);
  private editor?: EditorJS;
  readonly setupForm = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(120)]],
    description: ['', [Validators.required, Validators.maxLength(500)]],
    prompt: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
    num_chapters: [5, [Validators.required, Validators.pattern(/^\d+$/), Validators.min(1), Validators.max(15)]],
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
  generationProgress: GenerationProgress = {
    progress: 0,
    status_message: 'Conectando...',
    completed: false
  };

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
    const promptWithContext = [
      `Descripción: ${description}`,
      `Consigna principal: ${prompt}`,
      `Género: ${genre}.`,
      `Tipo de contenido: ${contentType}.`
    ].join('\n');

    this.ebooksService.generateEbook({
      title,
      description,
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
            error: () => this.failGeneration('Se perdió la conexión con el progreso del libro.')
          });
      },
      error: (error: { error?: { detail?: string }; message?: string }) => {
        this.isLoading = false;
        this.showProgressModal = false;
        this.formError = error.error?.detail ?? error.message ?? 'No se pudo crear el E-book. Intentá nuevamente.';
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
    this.changeDetector.markForCheck();

    if (progress.error) {
      this.failGeneration(progress.error);
      return;
    }

    if (progress.completed && progress.ebook_id) {
      this.isLoading = false;
      this.showProgressModal = false;
      this.generationSucceeded.emit();
      this.loadGeneratedEbook(progress.ebook_id);
    }
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
