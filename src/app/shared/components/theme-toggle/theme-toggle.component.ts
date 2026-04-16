import { Component, input, output, inject, ChangeDetectionStrategy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-theme-toggle',
  imports: [MatIconModule, MatButtonModule, MatTooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      mat-icon-button
      (click)="toggle.emit()"
      [matTooltip]="isDark() ? translationService.translate('theme.switchToLight') : translationService.translate('theme.switchToDark')"
      [attr.aria-label]="translationService.translate('theme.toggleTheme')">
      <mat-icon>{{ isDark() ? 'light_mode' : 'dark_mode' }}</mat-icon>
    </button>
  `,
})
export class ThemeToggleComponent {
  readonly translationService = inject(TranslationService);
  readonly isDark = input(false);
  readonly toggle = output<void>();
}
