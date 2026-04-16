import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly http = inject(HttpClient);
  private readonly storageService = inject(StorageService);

  readonly currentLang = signal<string>('en');
  readonly translations = signal<Record<string, string>>({});

  constructor() {
    const saved = this.storageService.loadLanguagePreference();
    this.setLanguage(saved);
  }

  setLanguage(lang: string): void {
    this.currentLang.set(lang);
    this.storageService.saveLanguagePreference(lang);
    this.loadTranslations(lang);
  }

  translate(key: string): string {
    return this.translations()[key] ?? key;
  }

  private loadTranslations(lang: string): void {
    this.http.get<Record<string, string>>(`/assets/i18n/${lang}.json`).subscribe({
      next: (data) => this.translations.set(data),
      error: () => {
        if (lang !== 'en') this.loadTranslations('en');
      },
    });
  }
}
