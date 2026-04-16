import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Difficulty } from '../../../../core/models/sudoku.model';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-new-game-dialog',
  imports: [MatDialogModule, MatButtonModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './new-game-dialog.component.html',
  styleUrl: './new-game-dialog.component.scss',
})
export class NewGameDialogComponent {
  readonly difficulties = [
    { value: Difficulty.Easy, label: 'difficulty.easy' },
    { value: Difficulty.Medium, label: 'difficulty.medium' },
    { value: Difficulty.Hard, label: 'difficulty.hard' },
    { value: Difficulty.Expert, label: 'difficulty.expert' },
  ];

  private readonly dialogRef = inject(MatDialogRef) as MatDialogRef<NewGameDialogComponent, Difficulty>;

  onSelect(difficulty: Difficulty): void {
    this.dialogRef.close(difficulty);
  }

  onCancel(): void {
    this.dialogRef.close(undefined);
  }
}
