import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GameStateService } from './services/game-state.service';
import { BoardComponent } from './components/board/board.component';
import { NumpadComponent } from './components/numpad/numpad.component';
import { TimerComponent } from './components/timer/timer.component';
import { GameControlsComponent } from './components/game-controls/game-controls.component';
import { NewGameDialogComponent } from './components/new-game-dialog/new-game-dialog.component';
import { CellPosition, Difficulty } from '../../core/models/sudoku.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-game',
  imports: [
    BoardComponent,
    NumpadComponent,
    TimerComponent,
    GameControlsComponent,
    TranslatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
  host: {
    '(window:keydown)': 'onKeyDown($event)',
  },
})
export class GameComponent implements OnInit, OnDestroy {
  readonly gameState = inject(GameStateService);
  private readonly dialog = inject(MatDialog);

  ngOnInit(): void {
    if (!this.gameState.loadSavedGame()) {
      this.openNewGameDialog(true);
    }
  }

  ngOnDestroy(): void {
    this.gameState.stopTimer();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (this.gameState.isComplete()) return;

    const key = event.key;

    if (key >= '1' && key <= '9') {
      this.gameState.placeNumber(parseInt(key, 10));
      event.preventDefault();
    } else if (key === 'Backspace' || key === 'Delete') {
      this.gameState.eraseCell();
      event.preventDefault();
    } else if (key === 'ArrowUp') {
      this.gameState.moveSelection('up');
      event.preventDefault();
    } else if (key === 'ArrowDown') {
      this.gameState.moveSelection('down');
      event.preventDefault();
    } else if (key === 'ArrowLeft') {
      this.gameState.moveSelection('left');
      event.preventDefault();
    } else if (key === 'ArrowRight') {
      this.gameState.moveSelection('right');
      event.preventDefault();
    } else if (key === 'Escape') {
      this.gameState.selectCell(null);
    } else if (key === 'z' && (event.ctrlKey || event.metaKey)) {
      this.gameState.undo();
      event.preventDefault();
    } else if ((key === 'n' || key === 'N') && !event.ctrlKey && !event.metaKey) {
      this.gameState.toggleHintMode();
      event.preventDefault();
    }
  }

  onCellSelect(pos: CellPosition): void {
    this.gameState.selectCell(pos);
  }

  onNumberSelect(num: number): void {
    this.gameState.placeNumber(num);
  }

  onErase(): void {
    this.gameState.eraseCell();
  }

  onUndo(): void {
    this.gameState.undo();
  }

  onToggleHints(): void {
    this.gameState.toggleHintMode();
  }

  openNewGameDialog(disableClose = false): void {
    const dialogRef = this.dialog.open(NewGameDialogComponent, {
      width: '340px',
      disableClose,
    });

    dialogRef.afterClosed().subscribe((difficulty: Difficulty | undefined) => {
      if (difficulty) {
        this.gameState.startNewGame(difficulty);
      }
    });
  }
}
