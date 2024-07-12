import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
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
  @Output() showSelectionPopover = new EventEmitter()
  @Output() viewSelectedListPopover = new EventEmitter()
  @Input() uniqueId: any;
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
  allowCustomEntities: any;

  constructor(
    private alertController: AlertController,
    private translateService: TranslateService
  ) { }

  onChange = (quantity) => {};

  onTouched = () => { };

  ngOnInit() { 
    this.originalLabel = this.control.label;
    this.isMobile = window.innerWidth <= 950;
    this.allowCustomEntities = this.control.meta.allow_custom_entities
  }

  writeValue(value: any[]) {
    this.selectedData = this.control.meta.searchData ? this.control.meta.searchData : []
    this.selectedChips = this.selectedData.map( data => data.id )
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

  handleCloseIconClick(event: Event, removedItem): void {
    if (this.selectedData) {
      this.selectedData = this.selectedData.filter(obj => obj.value !== removedItem.value || obj.id !== removedItem.id );
      this.onChange(this.selectedData)
      event.stopPropagation()
    }
  }

  async showPopover() {
    this.markAsTouched();
    this.showSelectionPopover.emit({type: this.control.meta.addPopupType, id: this.uniqueId})
  }

  

  async viewSelectedList() {
    this.markAsTouched();
    this.showSelectionPopover.emit({type:this.control.meta.addPopupType+' view', id: this.uniqueId})
  }

  async addNewOption() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Add ' + `${this.control.label}`,
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Enter ' + `${this.control.label}`,
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
            let obj = {
              label: alertData.name,
              value: alertData.name
            };
            this.selectedData.push(obj);
            this.selectedChips.push(obj.value)
            this.onChange(this.selectedData.map(data => data.value));
            this.icon = this.selectedData.length ? this.closeIconLight : this.addIconDark
          }
      }
      
      ],
    });
    await alert.present();
  }
}
