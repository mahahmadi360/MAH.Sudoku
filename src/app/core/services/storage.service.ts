import { Injectable } from '@angular/core';
import { SavedGameState } from '../models/game-state.model';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly GAME_STATE_KEY = 'sudoku_game_state';
  private readonly THEME_KEY = 'sudoku_theme';
  private readonly LANGUAGE_KEY = 'sudoku_language';

  saveGameState(state: SavedGameState): void {
    try {
      localStorage.setItem(this.GAME_STATE_KEY, JSON.stringify(state));
    } catch {
      // Storage full or unavailable
    }
  }

  loadGameState(): SavedGameState | null {
    try {
      const data = localStorage.getItem(this.GAME_STATE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  clearGameState(): void {
    localStorage.removeItem(this.GAME_STATE_KEY);
  }

  saveThemePreference(isDark: boolean): void {
    localStorage.setItem(this.THEME_KEY, JSON.stringify(isDark));
  }

  loadThemePreference(): boolean | null {
    try {
      const data = localStorage.getItem(this.THEME_KEY);
      return data !== null ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  saveLanguagePreference(lang: string): void {
    localStorage.setItem(this.LANGUAGE_KEY, lang);
  }

  loadLanguagePreference(): string {
    return localStorage.getItem(this.LANGUAGE_KEY) ?? 'en';
  }
}
