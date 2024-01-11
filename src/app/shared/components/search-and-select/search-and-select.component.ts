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
  addIconDark = {name: 'add-outline', color: 'dark'}
  closeIconLight = {name: 'close-circle-sharp', color: 'light'}
  selectedData: any;
  originalLabel: any;
  icon = this.addIconDark;
  value: any[];

  constructor(
    private popoverCtrl: PopoverController,
    private translateService: TranslateService
  ) { }

  onChange = (quantity) => {};

  onTouched = () => { };

  ngOnInit() { 

    this.originalLabel = this.control.label
  }

  writeValue(value: any[]) {
    this.selectedData = value;
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

  async showPopover(event) {
    console.log(this.control)
    const popover = await this.popoverCtrl.create({
      component: SearchPopoverComponent,
      cssClass: 'search-popover-config',
      componentProps: {
        control: this.control
      }
    });

    popover.onDidDismiss().then((data) => {
      if (data) {
        console.log(data)
        this.selectedData = data
        this.onChange(this.selectedData.data)
        this.icon = this.closeIconLight
      }
    });
    await popover.present();
  }

  clearControl(event){
    this.control.label = this.originalLabel
    this.selectedData = null
    this.icon = this.addIconDark
    this.onChange(null)
    event.stopPropagation()
  }

  // Your component code
handleIconClick(event: Event): void {
  if (this.selectedData) {
    this.clearControl(event);
  }
}

getMenteeLabel(): string {
  if (this.selectedData) {
    const { labelWhenSelected, label } = this.control?.meta;
    const count = this.selectedData?.data?.length;
    return `${this.selectedData ? labelWhenSelected : label}   ${count !== undefined ? count : ''}`;
  }
  return this.control.label;
}

getMentorLabel(): string {
  if (this.selectedData) {
    const { label } = this.control?.meta;
    const data = this.selectedData?.data[0];
    const count = this.selectedData?.role === 'mentee' ? this.selectedData?.data?.length : undefined;
    return `${this.selectedData ? data.name : label}, ${data.organisation}   ${count !== undefined ? count : ''}`;
  }
  return this.control.label;;
}
}
