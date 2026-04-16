// src/app/core/interceptors/base-href.interceptor.ts
import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AssertInterceptor implements HttpInterceptor {
  private readonly document = inject(DOCUMENT);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const baseHref = this.document.querySelector('base')?.getAttribute('href') ?? '/';

    if (req.url.startsWith('/assets/')) {
      const normalizedBase = baseHref.endsWith('/') ? baseHref.slice(0, -1) : baseHref;
      const url = `${normalizedBase}${req.url}`;
      return next.handle(req.clone({ url }));
    }

    return next.handle(req);
  }
}