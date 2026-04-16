import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-toolbar',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    ThemeToggleComponent,
    TranslatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
})
export class ToolbarComponent {
  readonly isDarkMode = input(false);
  readonly currentLang = input('en');
  readonly availableLanguages = input<{ code: string; label: string }[]>([]);

  readonly newGame = output<void>();
  readonly themeToggle = output<void>();
  readonly languageChange = output<string>();
}
