import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash-es';
import { ToastService } from 'src/app/core/services';

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
    private translateService: TranslateService,
    private toast:ToastService
  ) { }

  onChange = (quantity) => {};

  onTouched = () => { };

  ngOnInit() { 
    this.originalLabel = this.control.label;
    this.isMobile = window.innerWidth <= 950;
    this.allowCustomEntities = this.control.meta.allow_custom_entities;
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
      this.onChange(this.selectedData.map(data => data.value || data.id))
      event.stopPropagation()
    }
  }

  removeFile(index: number) {
    if (this.control?.value) {
      const updatedFiles = [...this.control.value];
      updatedFiles.splice(index, 1);
  
      if (this.control.setValue) {
        this.control.setValue(updatedFiles);
      } else {
        this.control.value = updatedFiles;
      }
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
              value: alertData.name,
              type: "other"
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


  async addLink(data){
    console.log(data,"data in addlink");
    data.value = data.value || [];
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: this.translateService.instant('ADD_LINK'),
      inputs: [
      {
        name: 'name',
        type: 'text',
        placeholder: 'Enter link',
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
        if (alertData.name && alertData.name.startsWith('http://') || alertData.name.startsWith('https://')) {
          let obj = {
          name: alertData.name,
          type: data.name,
          isLink: true
          };
          data.value.push(obj);
          return true; 
        } else {
          this.toast.showToast(this.translateService.instant('INVALID_LINK'), 'danger');
          return false; 
        }
        }
      }
      ],
      backdropDismiss: false // Prevent dismissing the modal by clicking outside
    });
    await alert.present();
  }
}
