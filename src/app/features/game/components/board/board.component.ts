import { Component, input, output, inject, ChangeDetectionStrategy } from '@angular/core';
import { Board, CellPosition } from '../../../../core/models/sudoku.model';
import { CellComponent } from '../cell/cell.component';
import { TranslationService } from '../../../../core/services/translation.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-board',
  imports: [CellComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss',
})
export class BoardComponent {
  readonly translationService = inject(TranslationService);

  readonly board = input.required<Board>();
  readonly selectedCell = input<CellPosition | null>(null);
  readonly highlightedCells = input<Set<string>>(new Set());
  readonly selectedNumber = input<number | null>(null);

  readonly cellSelect = output<CellPosition>();

  isSelected(row: number, col: number): boolean {
    const sel = this.selectedCell();
    return sel !== null && sel.row === row && sel.col === col;
  }

  isHighlighted(row: number, col: number): boolean {
    return this.highlightedCells().has(`${row}-${col}`);
  }

  isConflict(row: number, col: number): boolean {
    const sel = this.selectedCell();
    if (!sel || sel.row !== row || sel.col !== col) return false;

    const cell = this.board()[row][col];
    if (cell.value === null) return false;

    for (const key of this.highlightedCells()) {
      const [r, c] = key.split('-').map(Number);
      if (r === row && c === col) continue;
      if (this.board()[r][c].value === cell.value) {
        return true;
      }
    }

    return false;
  }

  isSameNumber(value: number | null): boolean {
    const sel = this.selectedNumber();
    return sel !== null && value !== null && sel === value;
  }

  onCellSelect(row: number, col: number): void {
    this.cellSelect.emit({ row, col });
  }
}
