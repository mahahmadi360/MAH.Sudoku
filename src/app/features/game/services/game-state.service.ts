import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { Board, Cell, CellPosition, Difficulty } from '../../../core/models/sudoku.model';
import { MoveRecord, SavedGameState } from '../../../core/models/game-state.model';
import { StorageService } from '../../../core/services/storage.service';
import { SudokuGeneratorService } from './sudoku-generator.service';

@Injectable({ providedIn: 'root' })
export class GameStateService {
  private readonly storageService = inject(StorageService);
  private readonly generatorService = inject(SudokuGeneratorService);

  // Writable signals
  readonly board = signal<Board>([]);
  readonly difficulty = signal<Difficulty>(Difficulty.Easy);
  readonly selectedCell = signal<CellPosition | null>(null);
  readonly elapsedSeconds = signal<number>(0);
  readonly isRunning = signal<boolean>(false);
  readonly moveHistory = signal<MoveRecord[]>([]);
  readonly isComplete = signal<boolean>(false);
  readonly isHintMode = signal<boolean>(false);

  private timerInterval: ReturnType<typeof setInterval> | null = null;

  // Computed signals
  readonly isCorrect = computed(() => {
    const b = this.board();
    if (b.length === 0) return false;
    return b.every(row => row.every(cell => cell.value !== null && cell.value === cell.solution));
  });

  readonly selectedCellData = computed(() => {
    const pos = this.selectedCell();
    const b = this.board();
    if (!pos || b.length === 0) return null;
    return b[pos.row]?.[pos.col] ?? null;
  });

  readonly highlightedCells = computed(() => {
    const pos = this.selectedCell();
    if (!pos) return new Set<string>();
    const set = new Set<string>();
    for (let c = 0; c < 9; c++) set.add(`${pos.row}-${c}`);
    for (let r = 0; r < 9; r++) set.add(`${r}-${pos.col}`);
    const boxR = Math.floor(pos.row / 3) * 3;
    const boxC = Math.floor(pos.col / 3) * 3;
    for (let r = boxR; r < boxR + 3; r++) {
      for (let c = boxC; c < boxC + 3; c++) {
        set.add(`${r}-${c}`);
      }
    }
    return set;
  });

  readonly selectedNumber = computed(() => {
    const cell = this.selectedCellData();
    return cell?.value ?? null;
  });

  readonly numberCounts = computed(() => {
    const counts = new Map<number, number>();
    for (let n = 1; n <= 9; n++) counts.set(n, 0);
    for (const row of this.board()) {
      for (const cell of row) {
        if (cell.value) counts.set(cell.value, (counts.get(cell.value) ?? 0) + 1);
      }
    }
    return counts;
  });

  readonly canUndo = computed(() => this.moveHistory().length > 0);

  constructor() {
    // Auto-persist game state
    effect(() => {
      const b = this.board();
      const d = this.difficulty();
      const t = this.elapsedSeconds();
      const h = this.moveHistory();
      if (b.length > 0) {
        const serialized: SavedGameState = {
          board: b.map(row => row.map(cell => ({
            value: cell.value,
            solution: cell.solution,
            isGiven: cell.isGiven,
            notes: cell.notes,
          }))),
          difficulty: d,
          elapsedSeconds: t,
          moveHistory: h,
        };
        this.storageService.saveGameState(serialized);
      }
    });

    // Auto-stop timer and mark complete when puzzle is solved
    effect(() => {
      if (this.isCorrect()) {
        this.isComplete.set(true);
        this.stopTimer();
      }
    });
  }

  startNewGame(difficulty: Difficulty): void {
    this.stopTimer();
    const { puzzle, solution } = this.generatorService.generatePuzzle(difficulty);

    const board: Board = puzzle.map((row, r) =>
      row.map((value, c) => ({
        value: value === 0 ? null : value,
        solution: solution[r][c],
        isGiven: value !== 0,
        row: r,
        col: c,
        notes: [],
      }))
    );

    this.board.set(board);
    this.difficulty.set(difficulty);
    this.selectedCell.set(null);
    this.elapsedSeconds.set(0);
    this.moveHistory.set([]);
    this.isComplete.set(false);
    this.isHintMode.set(false);
    this.startTimer();
  }

  loadSavedGame(): boolean {
    const saved = this.storageService.loadGameState();
    if (!saved) return false;

    const board: Board = saved.board.map((row, r) =>
      row.map((cell, c) => ({
        ...cell,
        notes: cell.notes ?? [],
        row: r,
        col: c,
      }))
    );

    this.board.set(board);
    this.difficulty.set(saved.difficulty);
    this.elapsedSeconds.set(saved.elapsedSeconds);
    this.moveHistory.set(
      (saved.moveHistory ?? []).map(m => ({ ...m, kind: m.kind ?? 'value' }))
    );
    this.selectedCell.set(null);
    this.isHintMode.set(false);

    const allFilled = board.every(row => row.every(cell => cell.value !== null));
    const allCorrect = board.every(row => row.every(cell => cell.value === cell.solution));
    this.isComplete.set(allFilled && allCorrect);

    if (!this.isComplete()) {
      this.startTimer();
    }

    return true;
  }

  selectCell(pos: CellPosition | null): void {
    this.selectedCell.set(pos);
  }

  placeNumber(num: number): void {
    const pos = this.selectedCell();
    const b = this.board();
    if (!pos || b.length === 0) return;

    const cell = b[pos.row][pos.col];
    if (cell.isGiven || this.isComplete()) return;

    if (this.isHintMode()) {
      this.toggleNote(pos.row, pos.col, num);
      return;
    }

    const clearedNotePositions = this.clearNotesFromHighlightedCells(num, pos);
    const move: MoveRecord = {
      kind: 'value',
      position: { ...pos },
      previousValue: cell.value,
      newValue: num,
      previousNotes: cell.notes.length > 0 ? [...cell.notes] : undefined,
      clearedNotePositions,
      clearedNoteDigit: num,
    };

    this.moveHistory.update(history => [...history, move]);
    this.updateCell(pos.row, pos.col, num, []);
  }

  toggleHintMode(): void {
    this.isHintMode.update(v => !v);
  }

  private toggleNote(row: number, col: number, digit: number): void {
    const cell = this.board()[row][col];
    if (cell.isGiven || cell.value !== null || this.isComplete()) return;

    const has = cell.notes.includes(digit);
    const newNotes = has
      ? cell.notes.filter(n => n !== digit)
      : [...cell.notes, digit].sort((a, b) => a - b);

    this.moveHistory.update(history => [
      ...history,
      {
        kind: 'note',
        position: { row, col },
        previousValue: null,
        newValue: null,
        noteDigit: digit,
        noteAdded: !has,
      },
    ]);
    this.updateCellNotes(row, col, newNotes);
  }

  eraseCell(): void {
    const pos = this.selectedCell();
    const b = this.board();
    if (!pos || b.length === 0) return;

    const cell = b[pos.row][pos.col];
    if (cell.isGiven || cell.value === null || this.isComplete()) return;

    const move: MoveRecord = {
      kind: 'value',
      position: { ...pos },
      previousValue: cell.value,
      newValue: null,
    };

    this.moveHistory.update(history => [...history, move]);
    this.updateCell(pos.row, pos.col, null);
  }

  undo(): void {
    const history = this.moveHistory();
    if (history.length === 0 || this.isComplete()) return;

    const lastMove = history[history.length - 1];
    this.moveHistory.update(h => h.slice(0, -1));

    if (lastMove.kind === 'note' && lastMove.noteDigit !== undefined) {
      const cell = this.board()[lastMove.position.row][lastMove.position.col];
      const digit = lastMove.noteDigit;
      // If the note was added, remove it; if it was removed, add it back.
      const restored = lastMove.noteAdded
        ? cell.notes.filter(n => n !== digit)
        : [...cell.notes, digit].sort((a, b) => a - b);
      this.updateCellNotes(lastMove.position.row, lastMove.position.col, restored);
    } else {
      this.updateCell(
        lastMove.position.row,
        lastMove.position.col,
        lastMove.previousValue,
        lastMove.previousNotes,
      );

      if (lastMove.clearedNotePositions?.length && lastMove.clearedNoteDigit !== undefined) {
        this.restoreClearedHighlightedNotes(lastMove.clearedNotePositions, lastMove.clearedNoteDigit);
      }
    }
    this.selectedCell.set(lastMove.position);
  }

  private clearNotesFromHighlightedCells(digit: number, selectedPos: CellPosition): CellPosition[] {
    const removed: CellPosition[] = [];
    const highlighted = this.highlightedCells();

    this.board.update(board =>
      board.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          if (!highlighted.has(`${rowIndex}-${colIndex}`)) return cell;
          if (rowIndex === selectedPos.row && colIndex === selectedPos.col) return cell;
          if (!cell.notes.includes(digit)) return cell;

          removed.push({ row: rowIndex, col: colIndex });
          return { ...cell, notes: cell.notes.filter(n => n !== digit) };
        })
      )
    );

    return removed;
  }

  private restoreClearedHighlightedNotes(positions: CellPosition[], digit: number): void {
    this.board.update(board =>
      board.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          if (!positions.some(pos => pos.row === rowIndex && pos.col === colIndex)) return cell;
          if (cell.notes.includes(digit)) return cell;
          return { ...cell, notes: [...cell.notes, digit].sort((a, b) => a - b) };
        })
      )
    );
  }

  moveSelection(direction: 'up' | 'down' | 'left' | 'right'): void {
    const pos = this.selectedCell();
    if (!pos) {
      this.selectedCell.set({ row: 0, col: 0 });
      return;
    }

    let { row, col } = pos;
    switch (direction) {
      case 'up': row = Math.max(0, row - 1); break;
      case 'down': row = Math.min(8, row + 1); break;
      case 'left': col = Math.max(0, col - 1); break;
      case 'right': col = Math.min(8, col + 1); break;
    }

    this.selectedCell.set({ row, col });
  }

  startTimer(): void {
    this.stopTimer();
    this.isRunning.set(true);
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds.update(s => s + 1);
    }, 1000);
  }

  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.isRunning.set(false);
  }

  private updateCell(row: number, col: number, value: number | null, notes?: number[]): void {
    this.board.update(board =>
      board.map((r, ri) =>
        ri !== row ? r : r.map((cell, ci) =>
          ci !== col ? cell : { ...cell, value, notes: notes ?? cell.notes }
        )
      )
    );
  }

  private updateCellNotes(row: number, col: number, notes: number[]): void {
    this.board.update(board =>
      board.map((r, ri) =>
        ri !== row ? r : r.map((cell, ci) =>
          ci !== col ? cell : { ...cell, notes }
        )
      )
    );
  }
}
