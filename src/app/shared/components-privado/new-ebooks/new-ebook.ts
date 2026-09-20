import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Quote from '@editorjs/quote';

@Component({
  selector: 'app-new-ebook',
  standalone: true,
  templateUrl: './new-ebook.html',
  styleUrl: './new-ebook.css'
})
export class NewEbook implements AfterViewInit, OnDestroy {
  private editor?: EditorJS;
  saveMessage = '';
  wordCount = 0;

  ngAfterViewInit(): void {
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
              text: 'Capítulo III: Los Espejos de Papel',
              level: 1
            }
          },
          {
            type: 'paragraph',
            data: {
              text: '<b>Era</b> una tarde templada en la biblioteca de los manuscritos olvidados. El crujido de las páginas al pasar desvelaba no solo historias ajenas, sino las resonancias más íntimas de una memoria que de una memoria que se negaba a diluirse entre las sombras del atardecer.'
            }
          },
          {
            type: 'paragraph',
            data: {
              text: 'Cada volumen se asentaba sobre el papel vitela con la serenidad de una verdad inapelable. Al levantar la mirada hacia el gran ventanal del atrio, la penumbra filtraba destellos cobrizos sobre los anaqueles más altos.'
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
    this.wordCount = output.blocks.reduce((total, block) => {
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
