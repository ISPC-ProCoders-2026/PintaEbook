import { AsyncPipe, NgFor } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Ebook } from '../../models/ebook.model';
import { EbookService } from '../../service/ebook.service';

@Component({
  selector: 'app-ebooks-list-page',
  standalone: true,
  imports: [AsyncPipe, NgFor],
  templateUrl: './ebooks-list.page.html',
  styleUrl: './ebooks-list.page.css'
})
export class EbooksListPage {
  private readonly ebookService = inject(EbookService);

  readonly ebooks$: Observable<Ebook[]> = this.ebookService.list();
}
