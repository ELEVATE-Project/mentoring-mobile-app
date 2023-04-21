import { Component, Input, OnInit } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
} from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { UUID } from 'angular2-uuid';
import * as _ from 'lodash-es';

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
  @Input() showAddOption;
  @Input() validators;
  disabled;
  touched = false;
  selectedChips;
  _selectAll;
  lowerCaseLabel;

  constructor(
    private alertController: AlertController,
    private translateService: TranslateService
  ) { }

  onChange = (quantity) => { };

  onTouched = () => { };

  ngOnInit() { 
    this.lowerCaseLabel = this.label.toLowerCase();
  }

  writeValue(value: any[]) {
    this.selectedChips = new Set();
    this.chips.map((chip) =>
      _.some(value, chip) ? this.selectedChips.add(chip) : null
    );
    if (this.selectedChips.size === this.chips.length) {
      this._selectAll = true;
    }
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
      this.chips.map((chip) => this.selectedChips.add(chip));
    } else {
      this.selectedChips.clear();
    }
    if (!this.selectedChips.size) {
      this.onChange('');
    } else {
      this.onChange([...this.selectedChips]);
    }
  }
  async addNewOption() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Add ' + `${this.lowerCaseLabel}`,
      inputs: [
        {
          name: 'chip',
          type: 'text',
          placeholder: 'Enter ' + `${this.lowerCaseLabel}`,
        },
      ],
      buttons: [
        {
          text: this.translateService.instant('CANCEL'),
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => { },
        },
        {
          text: this.translateService.instant('OK'),
          handler: (alertData) => {
            if (alertData?.chip !== "") {
              let obj = {
                label: alertData.chip,
                value: UUID.UUID(),
              };
              this.chips.push(obj);
              this.onChipClick(obj);
            }
          },
        },
      ],
    });
    await alert.present();
  }
}
