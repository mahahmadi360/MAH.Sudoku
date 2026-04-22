import { Difficulty, CellPosition } from './sudoku.model';

export type MoveKind = 'value' | 'note';

export interface MoveRecord {
  kind: MoveKind;
  position: CellPosition;
  previousValue: number | null;
  newValue: number | null;
  // For 'value' moves, captures notes that were cleared when the value was committed
  previousNotes?: number[];
  clearedNotePositions?: CellPosition[];
  clearedNoteDigit?: number;
  // For 'note' moves
  noteDigit?: number;
  noteAdded?: boolean;
}

export interface SavedGameState {
  board: SerializedCell[][];
  difficulty: Difficulty;
  elapsedSeconds: number;
  moveHistory: MoveRecord[];
}

export interface SerializedCell {
  value: number | null;
  solution: number;
  isGiven: boolean;
  notes: number[];
}
