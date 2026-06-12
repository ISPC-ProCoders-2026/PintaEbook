import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../service/api-base-url.token';

function isAbsoluteUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

export const apiBaseUrlInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const apiBaseUrl = inject(API_BASE_URL);

  if (isAbsoluteUrl(req.url)) return next(req);

  // Solo prefijamos rutas tipo "/ebooks". Si viene "ebooks" lo dejamos.
  if (!req.url.startsWith('/')) return next(req);

  const url = `${apiBaseUrl}${req.url}`;
  return next(req.clone({ url }));
};
