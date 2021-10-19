import { Component, Input, OnInit } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
} from '@angular/forms';

@Component({
  selector: 'app-input-chip',
  templateUrl: './input-chip.component.html',
  styleUrls: ['./input-chip.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: InputChipComponent,
    },
  ],
})
export class InputChipComponent implements OnInit, ControlValueAccessor {
  @Input() label;
  @Input() chips;
  @Input() showSelectAll;
  disabled;
  touched = false;
  selectedChips;
  _selectAll;

  constructor() {}

  onChange = (quantity) => {};

  onTouched = () => {};

  ngOnInit() {}

  writeValue(value: any[]) {
    this.selectedChips = new Set(value);
  }
  registerOnChange(onChange: any) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: any) {
    this.onTouched = onTouched;
  }
  markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }
  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }
  onChipClick(chip) {
    this.markAsTouched();
    if (this.disabled) {
      return;
    }
    if (this.selectedChips.has(chip)) {
      this.selectedChips.delete(chip);
    } else {
      this.selectedChips.add(chip);
    }
    if (!this.selectedChips.size) {
      this.onChange('');
    } else {
      this.onChange([...this.selectedChips]);
    }
    if (this.selectedChips.size !== this.chips.length) {
      this._selectAll = false;
    } else {
      this._selectAll = true;
    }
  }

  selectAll() {
    this.markAsTouched();
    if (this._selectAll) {
      this.chips.map((chip) => this.selectedChips.add(chip.name));
    } else {
      this.selectedChips.clear();
    }
    if (!this.selectedChips.size) {
      this.onChange('');
    } else {
      this.onChange([...this.selectedChips]);
    }
  }
}
