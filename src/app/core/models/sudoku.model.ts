export enum Difficulty {
  Easy = 'easy',
  Medium = 'medium',
  Hard = 'hard',
  Expert = 'expert',
}

export const DIFFICULTY_REMOVALS: Record<Difficulty, number> = {
  [Difficulty.Easy]: 30,
  [Difficulty.Medium]: 40,
  [Difficulty.Hard]: 50,
  [Difficulty.Expert]: 56,
};

export interface CellPosition {
  row: number;
  col: number;
}

export interface Cell {
  value: number | null;
  solution: number;
  isGiven: boolean;
  row: number;
  col: number;
  notes: number[];
}

export type Board = Cell[][];
export type RawGrid = number[][];
