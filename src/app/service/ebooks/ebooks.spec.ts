import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { EbooksService } from './ebooks';
import { environment } from '../../../environments/environment.generated';

describe('EbooksService creation workflow', () => {
  let service: EbooksService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EbooksService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(EbooksService);
    httpTesting = TestBed.inject(HttpTestingController);
    localStorage.setItem('token', 'test-access-token');
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  it('posts the backend field names with the official bearer token and returns the UUID', () => {
    let ebookId = '';
    service.generateEbook({
      title: 'Guía breve',
      description: '',
      prompt: 'Una introducción para lectores nuevos',
      num_chapters: 3
    }).subscribe((result) => ebookId = result.ebook_id);

    const request = httpTesting.expectOne(`${environment.apiBaseUrl}/ebooks/`);
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.get('Authorization')).toBe('Bearer test-access-token');
    expect(request.request.body).toEqual({
      title: 'Guía breve',
      description: '',
      prompt_idea: 'Una introducción para lectores nuevos',
      quantity_chapters: 3
    });
    request.flush({ ebook_id: '550e8400-e29b-41d4-a716-446655440000' });
    expect(ebookId).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  it('reads the current credit balance from the configured billing endpoint', () => {
    let credits = 0;
    service.getCreditBalance().subscribe((balance) => credits = balance.credits_available);

    const request = httpTesting.expectOne(`${environment.apiBaseUrl}/billing/balance/`);
    expect(request.request.method).toBe('GET');
    expect(request.request.headers.get('Authorization')).toBe('Bearer test-access-token');
    request.flush({ credits_available: 90, last_updated: '2026-10-01T20:00:00Z' });
    expect(credits).toBe(90);
  });
});
