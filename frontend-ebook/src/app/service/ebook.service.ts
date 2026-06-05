import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Ebook } from '../models/ebook.model';

@Injectable({ providedIn: 'root' })
export class EbookService {
  private readonly http = inject(HttpClient);

  list(): Observable<Ebook[]> {
    // URL relativa: el interceptor la convierte a absoluta con API_BASE_URL
    return this.http.get<Ebook[]>('/ebooks');
  }
}
