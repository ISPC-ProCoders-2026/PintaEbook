import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-book-loader',
  templateUrl: './book-loader.html',
  styleUrl: './book-loader.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookLoader {
  @Input() message = 'Estamos preparando tu proyecto...';
}
