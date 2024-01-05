import { Component, Input, OnInit } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
} from '@angular/forms';
import { AlertController, PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash-es';
import { SearchPopoverComponent } from '../search-popover/search-popover.component';

@Component({
  selector: 'app-search-and-select',
  templateUrl: './search-and-select.component.html',
  styleUrls: ['./search-and-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: SearchAndSelectComponent,
    },
  ],
})
export class SearchAndSelectComponent implements OnInit, ControlValueAccessor {
  @Input() control;
  disabled;
  touched = false;
  selectedChips;
  _selectAll;
  lowerCaseLabel;

  constructor(
    private popoverCtrl: PopoverController,
    private translateService: TranslateService
  ) { }

  onChange = (quantity) => { };

  onTouched = () => { };

  ngOnInit() { 
  }

  writeValue(value: any[]) {
    // this.selectedChips = new Set();
    // this.chips.map((chip) =>
    //   _.some(value, chip) ? this.selectedChips.add(chip) : null
    // );
    // if (this.selectedChips.size === this.chips.length) {
    //   this._selectAll = true;
    // }
  }
  registerOnChange(onChange: any) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: any) {
    this.onTouched = onTouched;
  }
  markAsTouched() {
    // if (!this.touched) {
    //   this.onTouched();
    //   this.touched = true;
    // }
  }
  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }
  onChipClick(chip) {
    // this.markAsTouched();
    // if (this.disabled) {
    //   return;
    // }
    // if (this.selectedChips.has(chip)) {
    //   this.selectedChips.delete(chip);
    // } else {
    //   this.selectedChips.add(chip);
    // }
    // if (!this.selectedChips.size) {
    //   this.onChange('');
    // } else {
    //   this.onChange([...this.selectedChips]);
    // }
    // if (this.selectedChips.size !== this.chips.length) {
    //   this._selectAll = false;
    // } else {
    //   this._selectAll = true;
    // }
  }

  selectAll() {
    // this.markAsTouched();
    // if (this._selectAll) {
    //   this.chips.map((chip) => this.selectedChips.add(chip));
    // } else {
    //   this.selectedChips.clear();
    // }
    // if (!this.selectedChips.size) {
    //   this.onChange('');
    // } else {
    //   this.onChange([...this.selectedChips]);
    // }
  }
  async showPopover(event) {
    const popover = await this.popoverCtrl.create({
      component: SearchPopoverComponent,
      cssClass: 'search-popover-config',
      event
    });
    await popover.present();
  }
}
