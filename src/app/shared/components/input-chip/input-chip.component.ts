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
import * as _ from 'lodash-es';
import { ToastService } from 'src/app/core/services';

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
    standalone: false
})
export class InputChipComponent implements OnInit, ControlValueAccessor {
  @Input() label = '';
  @Input() chips: any[] = [];
  @Input() showSelectAll = false;
  @Input() showAddOption: any;
  @Input() validators: any = {};
  @Input() allowCustomEntities = false;
  disabled = false;
  touched = false;
  selectedChips = new Set<any>();
  _selectAll = false;
  lowerCaseLabel = '';

  constructor(
    private alertController: AlertController,
    private translateService: TranslateService,
    private toast: ToastService,
  ) { }

  onChange = (quantity) => { };

  onTouched = () => { };

  ngOnInit() { 
    this.lowerCaseLabel = (this.label || '').toLowerCase();
  }

  get isRequired(): boolean {
    return !!this.validators?.required && !this.disabled;
  }

  get addChipLabelKey(): string {
    return this.showAddOption?.addChipLabel || 'ADD';
  }

  writeValue(value: any[] = []) {
    this.selectedChips = new Set();
    this.chips.forEach((chip) =>
      _.some(value, chip) ? this.selectedChips.add(chip) : null
    );
    this._selectAll = this.chips.length > 0 && this.selectedChips.size === this.chips.length;
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
    this._selectAll = this.chips.length > 0 && this.selectedChips.size === this.chips.length;
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
          attributes: {
            maxlength: 50,
          }
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
              const regexPattern = /[^A-Za-z0-9\s_]/;
              const filteredChip = alertData?.chip.trim();
              if (filteredChip !== "" && !regexPattern.test(filteredChip)) {
                  let obj = {
                      label: filteredChip,
                      value: filteredChip
                  };
                  this.chips.push(obj);
                  this.onChipClick(obj);
              } else {
                  this.toast.showToast("INPUT_CHIP_ERROR_TOAST_MESSAGE", "danger");
                  return false;
              }
          }
      }
      
      ],
    });
    await alert.present();
  }
}
