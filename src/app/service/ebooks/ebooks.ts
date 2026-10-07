import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment.generated';

export interface CreateEbookRequest {
  title: string;
  description: string;
  prompt_idea: string;
  quantity_chapters: number;
}

export interface CreateEbookResponse {
  ebook_id: string;
  title: string;
  description: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  created_at: string;
  updated_at: string;
  credits_available?: number;
}

@Injectable({ providedIn: 'root' })
export class EbooksService {
  private readonly apiUrl = `${environment.apiBaseUrl}/ebooks/`;

  constructor(private readonly http: HttpClient) {}

  createEbook(payload: CreateEbookRequest): Observable<CreateEbookResponse> {
    const token = localStorage.getItem('token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    return this.http.post<CreateEbookResponse>(this.apiUrl, payload, { headers });
  }
}