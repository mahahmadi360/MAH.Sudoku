import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { ToolbarComponent } from './shared/components/toolbar/toolbar.component';
import { GameComponent } from './features/game/game.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToolbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  readonly themeService = inject(ThemeService);

  readonly availableLanguages = [
    { code: 'en', label: 'EN' },
  ];

  currentLang = 'en';

  readonly gameComponent = signal<GameComponent | undefined>(undefined);

  onNewGame(): void {
    this.gameComponent()?.openNewGameDialog();
  }

  onThemeToggle(): void {
    this.themeService.toggleTheme();
  }

  onLanguageChange(lang: string): void {
    this.currentLang = lang;
  }

  onRouterActivate(component: unknown): void {
    if (component instanceof GameComponent) {
      this.gameComponent.set(component);
    }
  }
}
