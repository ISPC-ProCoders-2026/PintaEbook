import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { environment } from '../environments/environment.generated';
import { routes } from './app.routes';
import { apiBaseUrlInterceptor } from './interceptors/api-base-url.interceptor';
import { API_BASE_URL } from './service/api-base-url.token';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([apiBaseUrlInterceptor])),
    { provide: API_BASE_URL, useValue: environment.apiBaseUrl },
    provideRouter(routes)
  ]
};
