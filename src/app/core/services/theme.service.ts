import { Injectable, signal, inject, PLATFORM_ID, DOCUMENT } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageService = inject(StorageService);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  readonly isDarkMode = signal<boolean>(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const saved = this.storageService.loadThemePreference();
      if (saved === null) {
        this.isDarkMode.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
      } else {
        this.isDarkMode.set(saved);
      }
      this.applyTheme();
    }
  }

  toggleTheme(): void {
    this.isDarkMode.update(v => !v);
    this.applyTheme();
    this.storageService.saveThemePreference(this.isDarkMode());
  }

  private applyTheme(): void {
    const html = this.document.documentElement;
    const theme = this.isDarkMode() ? 'dark' : 'light';
    html.setAttribute('data-theme', theme);
    html.style.colorScheme = theme;
  }
}
