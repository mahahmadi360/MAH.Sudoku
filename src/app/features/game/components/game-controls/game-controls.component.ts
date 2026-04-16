import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-game-controls',
  imports: [MatButtonModule, MatIconModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './game-controls.component.html',
  styleUrl: './game-controls.component.scss',
})
export class GameControlsComponent {
  readonly canUndo = input(false);
  readonly isHintMode = input(false);

  readonly undo = output<void>();
  readonly erase = output<void>();
  readonly toggleHints = output<void>();

  onUndo(): void {
    this.undo.emit();
  }

  onErase(): void {
    this.erase.emit();
  }

  onToggleHints(): void {
    this.toggleHints.emit();
  }
}
