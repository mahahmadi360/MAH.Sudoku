import { Component, input, output, inject, ChangeDetectionStrategy } from '@angular/core';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
  selector: 'app-numpad',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './numpad.component.html',
  styleUrl: './numpad.component.scss',
})
export class NumpadComponent {
  readonly translationService = inject(TranslationService);

  readonly numberCounts = input<Map<number, number>>(new Map());

  readonly numberSelect = output<number>();

  readonly numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  isCompleted(num: number): boolean {
    return (this.numberCounts().get(num) ?? 0) >= 9;
  }

  getNumberAriaLabel(num: number): string {
    return this.translationService.translate('aria.placeNumber') + ' ' + num;
  }

  onNumberSelect(num: number): void {
    this.numberSelect.emit(num);
  }
}
