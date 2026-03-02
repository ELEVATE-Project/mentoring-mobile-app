import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash-es';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { HttpService, ToastService } from 'src/app/core/services';
import { PreAlertModalComponent } from '../pre-alert-modal/pre-alert-modal.component';

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
    standalone: false
})
export class SearchAndSelectComponent implements OnInit, ControlValueAccessor {
  @Input() control;
  @Output() showSelectionPopover = new EventEmitter()
  @Output() viewSelectedListPopover = new EventEmitter()
  @Input() uniqueId: any;
  @Input() sessionId: any;
  private static menteeControlRef: any;
  disabled;
  isDisabled: boolean;
  touched = false;
  selectedChips;
  _selectAll;
  addIconDark = {name: 'add-outline', color: 'dark'}
  closeIconLight = {name: 'close-circle-sharp', color: 'light'}
  selectedData: any[] = [];
  originalLabel: any;
  icon = this.addIconDark;
  value: any[];
  isMobile: any;
  allowCustomEntities: any;
  menteeValue: any;

  constructor(
    private alertController: AlertController,
    private translateService: TranslateService,
    private toast:ToastService,
    private httpService : HttpService,
    private modalController: ModalController,
    private cdr: ChangeDetectorRef
  ) { }

  onChange = (quantity) => {};

  onTouched = () => { };

  ngOnInit() { 
    this.originalLabel = this.control.label;
    this.isMobile = window.innerWidth <= 950;
    this.allowCustomEntities = this.control.meta.allow_custom_entities;
  }

  get showMoreChip(): boolean {
    return this.selectedData.length > 5;
  }

  get remainingSelectedCount(): number {
    return this.selectedData.length - 5;
  }

  writeValue(value: any[]) {
    setTimeout(() => {
      if(this.control.name === 'mentees') {
        SearchAndSelectComponent.menteeControlRef = this.control;
      }
      this.selectedData = this.control.meta.searchData ? this.control.meta.searchData : [];
      this.selectedChips = this.selectedData.map( data => data.id );
      this.icon = this.selectedData.length ? this.closeIconLight : this.addIconDark;
      if (this.control.name === 'mentees') {
        this.selectedData = this.selectedData.map(data => ({...data, isDisabled: true}));
      }
      this.cdr.detectChanges();
    });
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
    if(this.control.name === 'mentor_id') {
        SearchAndSelectComponent.menteeControlRef.disabled = true;
    }
  }

  removeFile(data:any,index:number) { 
    if (this.control?.value ) {
      const updatedFiles = [...this.control.value];
      if(data.id && this.control.name == 'pre' || this.control.name == 'post'){
        this.httpService.get({url:urlConstants.API_URLS.RESOURCES_DELETE+data.id+'?sessionId='+this.sessionId}).then((res:any) => {
          if(res.responseCode == 'OK'){
            updatedFiles.splice(index, 1);
            this.toast.showToast(this.translateService.instant('SESSION_RESOURCE_DELETE'), 'success');
            if (this.control.setValue) {
              this.control.setValue(updatedFiles);
            } else {
              this.control.value = updatedFiles;
            }
            this.onChange(updatedFiles);
            this.cdr.detectChanges();
          } else {
            this.toast.showToast(this.translateService.instant('FILE_NOT_DELETED'), 'danger');
          }
        }
        ).catch((err) => {
          this.toast.showToast(this.translateService.instant('FILE_NOT_DELETED'), 'danger');
        }
        );
      }else{
      updatedFiles.splice(index, 1);
      if (this.control.setValue) {
        this.toast.showToast(this.translateService.instant('SESSION_RESOURCE_DELETE'), 'success');
        this.control.setValue(updatedFiles);
      } else {
        this.control.value = updatedFiles;
      }
      this.onChange(updatedFiles);
      this.cdr.detectChanges();
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
            this.cdr.detectChanges();
          }
      }
      
      ],
    });
    await alert.present();
  }


  async addLink(data){
    data.value = data.value || [];
    const modal = await this.modalController.create({
      component: PreAlertModalComponent,
      cssClass: 'pre-custom-modal',
      componentProps: {
        data: data, 
        type: 'link',
        heading: 'ADD_LINK_POPUP'
      },
      backdropDismiss: false
    });
  
    modal.onDidDismiss().then((result) => {
      if (result.data && result.data.success) {
        data.value.push(result.data.data);
        this.cdr.detectChanges();
      }
    });
  
    return await modal.present();
  }
}
