import { Component, input, output, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { Cell } from '../../../../core/models/sudoku.model';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
  selector: 'app-cell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cell.component.html',
  styleUrl: './cell.component.scss',
})
export class CellComponent {
  private readonly translationService = inject(TranslationService);

  readonly cell = input.required<Cell>();
  readonly isSelected = input(false);
  readonly isHighlighted = input(false);
  readonly isConflict = input(false);
  readonly isSameNumber = input(false);
  readonly selectedNumber = input<number | null>(null);

  readonly select = output<void>();

  readonly digits = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

  readonly ariaLabel = computed(() => {
    const c = this.cell();
    const row = this.translationService.translate('aria.row');
    const col = this.translationService.translate('aria.column');
    const val = this.translationService.translate('aria.value');
    const empty = this.translationService.translate('aria.empty');
    return `${row} ${c.row + 1}, ${col} ${c.col + 1}, ${c.value ? val + ' ' + c.value : empty}`;
  });

  onSelect(): void {
    this.select.emit();
  }
}
