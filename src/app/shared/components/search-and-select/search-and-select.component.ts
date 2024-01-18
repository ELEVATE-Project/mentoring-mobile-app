import { Component, Input, OnInit } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { PopoverController } from '@ionic/angular';
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
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  async showPopover(event) {
    this.markAsTouched();
    console.log(this.control)
    const popover = await this.popoverCtrl.create({
      component: SearchPopoverComponent,
      cssClass: 'search-popover-config',
      componentProps: {
        control: this.control
      }
    });

    popover.onDidDismiss().then((data) => {
      if (data.data.length) {
        this.selectedData = data.data
        this.onChange(this.control.meta.multiSelect ? data.data.map(obj => obj.id) : data.data[0].id)
        
        this.icon = this.selectedData.length ? this.closeIconLight : this.addIconDark
      }
    });
    await popover.present();
  }

  clearControl(event){
    this.control.label = this.originalLabel
    this.selectedData = []
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
}
