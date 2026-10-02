import { AfterViewInit, Component, Input, OnDestroy, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { EbookSummary } from '../my-ebooks/my-ebooks';
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
  private readonly formBuilder = inject(FormBuilder);
  private editor?: EditorJS;
  readonly setupForm = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(120)]],
    author: ['', [Validators.required, Validators.maxLength(80)]],
    description: ['', [Validators.required, Validators.maxLength(500)]],
    genre: ['Ficción literaria', Validators.required],
    contentType: ['Novela', Validators.required]
  });
  showEditor = false;
  saveMessage = '';
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

    this.showEditor = true;
    queueMicrotask(() => this.initializeEditor());
  }

  private initializeEditor(): void {
    if (this.editor) return;

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

    void this.updateWordCount();
  }

  async saveDraft(): Promise<void> {
    if (!this.editor) return;

    await this.editor.save();
    this.saveMessage = 'Borrador guardado localmente';
    window.setTimeout(() => this.saveMessage = '', 2500);
  }

  async publishEbook(): Promise<void> {
    if (!this.editor) return;

    await this.editor.save();
    this.saveMessage = 'E-book preparado para publicar';
    window.setTimeout(() => this.saveMessage = '', 2500);
  }

  private async updateWordCount(): Promise<void> {
    if (!this.editor) return;

    const output = await this.editor.save();
    this.wordCount = output.blocks.reduce((total: number, block: { data: { text?: unknown } }) => {
      const text = String((block.data as { text?: string }).text ?? '')
        .replace(/<[^>]*>/g, ' ')
        .trim();
      return total + (text ? text.split(/\s+/).length : 0);
    }, 0);
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
  }
}
