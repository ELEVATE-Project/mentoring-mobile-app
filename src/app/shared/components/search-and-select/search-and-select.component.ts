import { Component, Input, OnInit } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { ModalController } from '@ionic/angular';
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
  selectedData=[];
  originalLabel: any;
  icon = this.addIconDark;
  value: any[];
  isMobile: any;

  constructor(
    private modalCtrl: ModalController,
    private translateService: TranslateService
  ) { }

  onChange = (quantity) => {};

  onTouched = () => { };

  ngOnInit() { 
    this.originalLabel = this.control.label;
    this.isMobile = window.innerWidth <= 800;
  }

  writeValue(value: any[]) {
    this.selectedData = this.control.meta.searchData ? this.control.meta.searchData : []
    this.icon = this.selectedData.length ? this.closeIconLight : this.addIconDark
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
    const popover = await this.modalCtrl.create({
      component: SearchPopoverComponent,
      cssClass: 'search-popover-config',
      backdropDismiss: false,
      componentProps: {
        data: {
          selectedData: this.selectedData,
          control: this.control,
          showFilter: true,
          showSearch: true,
          viewListMode: false,
          isMobile: this.isMobile
        }
      }
    });

    popover.onDidDismiss().then((data) => {
      if (data.data) {
        this.selectedData = data.data;
        const values = this.control.meta.multiSelect ? data.data.map(obj => obj.id) : data.data[0].id;
        this.onChange(values);
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

  async viewSelectedList() {
    this.markAsTouched();
    const popover = await this.modalCtrl.create({
      component: SearchPopoverComponent,
      cssClass: 'search-popover-config',
      backdropDismiss: false,
      componentProps: {
        data: {
          selectedData: this.selectedData,
          control: this.control,
          showFilter: false,
          showSearch: false,
          viewListMode: true,
          isMobile: this.isMobile
        }
      }
    });

    popover.onDidDismiss().then((data) => {
      if (data.data) {
        this.selectedData = data.data
        const values = this.selectedData.length
        ? (this.control.meta.multiSelect ? this.selectedData.map(obj => obj.id) : this.selectedData[0].id)
        : (this.control.meta.multiSelect ? [] : '');
        this.onChange(values);
        this.icon = this.selectedData.length ? this.closeIconLight : this.addIconDark
      }
    });
    await popover.present();
  }
  // Your component code
handleIconClick(event: Event): void {
  if (this.selectedData) {
    this.clearControl(event);
  }
}
}
