import { Injectable } from '@angular/core';
import { Difficulty, DIFFICULTY_REMOVALS, RawGrid } from '../../../core/models/sudoku.model';

@Injectable({ providedIn: 'root' })
export class SudokuGeneratorService {

  generatePuzzle(difficulty: Difficulty): { puzzle: RawGrid; solution: RawGrid } {
    const solution = this.generateSolvedGrid();
    const puzzle = this.removeClues(this.deepCopyGrid(solution), DIFFICULTY_REMOVALS[difficulty]);
    return { puzzle, solution };
  }

  private generateSolvedGrid(): RawGrid {
    const grid: RawGrid = Array.from({ length: 9 }, () => new Array(9).fill(0));
    this.fillGrid(grid);
    return grid;
  }

  private fillGrid(grid: RawGrid): boolean {
    const empty = this.findEmpty(grid);
    if (!empty) return true;

    const [row, col] = empty;
    const numbers = this.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    for (const num of numbers) {
      if (this.isValidPlacement(grid, row, col, num)) {
        grid[row][col] = num;
        if (this.fillGrid(grid)) return true;
        grid[row][col] = 0;
      }
    }

    return false;
  }

  private removeClues(grid: RawGrid, count: number): RawGrid {
    const positions = this.shuffleArray(
      Array.from({ length: 81 }, (_, i) => ({ row: Math.floor(i / 9), col: i % 9 }))
    );

    let removed = 0;
    for (const pos of positions) {
      if (removed >= count) break;

      const backup = grid[pos.row][pos.col];
      grid[pos.row][pos.col] = 0;

      if (this.countSolutions(this.deepCopyGrid(grid), 2) === 1) {
        removed++;
      } else {
        grid[pos.row][pos.col] = backup;
      }
    }

    return grid;
  }

  private countSolutions(grid: RawGrid, maxSolutions: number): number {
    const empty = this.findEmpty(grid);
    if (!empty) return 1;

    const [row, col] = empty;
    let count = 0;

    for (let num = 1; num <= 9; num++) {
      if (this.isValidPlacement(grid, row, col, num)) {
        grid[row][col] = num;
        count += this.countSolutions(grid, maxSolutions - count);
        grid[row][col] = 0;
        if (count >= maxSolutions) return count;
      }
    }

    return count;
  }

  private findEmpty(grid: RawGrid): [number, number] | null {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) return [row, col];
      }
    }
    return null;
  }

  private isValidPlacement(grid: RawGrid, row: number, col: number, num: number): boolean {
    for (let c = 0; c < 9; c++) {
      if (grid[row][c] === num) return false;
    }

    for (let r = 0; r < 9; r++) {
      if (grid[r][col] === num) return false;
    }

    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if (grid[r][c] === num) return false;
      }
    }

    return true;
  }

  private shuffleArray<T>(arr: T[]): T[] {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private deepCopyGrid(grid: RawGrid): RawGrid {
    return grid.map(row => [...row]);
  }
}
