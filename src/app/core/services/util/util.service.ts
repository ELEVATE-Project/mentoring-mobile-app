import { Injectable } from '@angular/core';
import { Share } from '@capacitor/share';
import { AlertController, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ISocialSharing } from '../../interface/soical-sharing-interface';
import { ModelComponent } from 'src/app/shared/components/model/model.component';
import * as Bowser from "bowser"
import { BehaviorSubject, Subject } from 'rxjs';
import * as Papa from 'papaparse';
import { LocalStorageService } from '../localstorage.service';

@Injectable({
  providedIn: 'root',
})
export class UtilService {
  modal: any;
  public canIonMenuShow = new Subject<boolean>();
  private searchTextSource = new BehaviorSubject<string>('');
  private criteriaChipSource = new BehaviorSubject<string>('');
  currentSearchText = this.searchTextSource.asObservable();
  currentCriteriaChip = this.criteriaChipSource.asObservable();

  ionMenuShow(data:boolean) {
    this.canIonMenuShow.next(data);
  }
  constructor(
    private modalCtrl: ModalController,
    private alert: AlertController,
    private translate: TranslateService,
    private localstorage:LocalStorageService
  ) {
    const browser = Bowser.getParser(window.navigator.userAgent);
  }

  getDeepLink(url){
    return window['env']['deepLinkUrl']+url;
  }

  async shareLink(param:ISocialSharing) {
    let {text,subject,link} = param;
    await Share.share({
      text: text,
      url: link,
      dialogTitle: subject,
    });
  }

  async openModal(componentProps) {
    this.modal = await this.modalCtrl.create({
      component: ModelComponent,
      componentProps: componentProps
    });
    this.modal.present();
    const { data, role } = await this.modal.onWillDismiss();
  }

  async alertPopup(msg) {
    return new Promise(async (resolve) => {
      let texts:any;
      this.translate.get([msg.header, msg.message,msg.cancel, msg.submit]).subscribe(text => {
        texts = text;
      })
      const alert = await this.alert.create({
        cssClass: 'my-custom-class',
        header: texts[msg.header],
        message: texts[msg.message],
        buttons: [
          {
            text: texts[msg.submit],
            cssClass: 'alert-button-bg-white',
            handler: () => {
              resolve(true);
            }
          },
          {
            text: texts[msg.cancel],
            role: 'cancel',
            cssClass: 'alert-button-red',
            handler: (blah) => {
              resolve(false);
            }
          },
        ]
      });
      await alert.present();
    });
  }

 async alertClose(){
    this.alert.getTop().then(alertInstance => {
      if (alertInstance) {
        alertInstance.dismiss();
      }
    });
  }

  getActionSheetButtons(profileImageData) {
    let texts
    this.translate
      .get([
        "ADD_PHOTO",
        "REMOVE_CURRENT_PHOTO_LABEL",
        "CHOOSE_FROM_LIBRARY",
        "TAKE_PHOTO",
        "CANCEL"
      ])
      .subscribe((data) => {
        texts = data;
      });
    let buttons = []
    let isMobile = this.isMobile()
    let removeCurrentPhotoValid = (profileImageData.image) ? true:false;
    switch (removeCurrentPhotoValid){
      case true:
        buttons = [
          {
            text: texts["REMOVE_CURRENT_PHOTO_LABEL"],
            type: 'remove',
            action: 'remove'
          }
        ]
        break;
    }

    switch (isMobile) {
      case true:
        buttons.push({
          text: texts["TAKE_PHOTO"],
            type: 'CAMERA',
            action: 'camera'
        })
        break;
    }
    
    buttons.push({
      text: texts["CHOOSE_FROM_LIBRARY"],
      type: 'PHOTOLIBRARY',
      action: 'camera'
    })
    buttons.push({
      text: texts["CANCEL"],
      type: 'CANCEL',
      action: "cancel",
    })
    return buttons;
  }

  isMobile(){
    return /iPhone|iPad|iPod|Android/i.test(window.navigator.userAgent);
  }

  getFormatedFilterData(filterData, formData) {;
    const result = [];
    for (const key in filterData) {
      if (key !== 'entity_types') {
        const title = key.charAt(0).toUpperCase() + key.slice(1);
        const name = key;
        const options = filterData[key].map(item => ({
          id: item.id,
          label: item.name,
          value: item.code
        }));
        const type = formData.filters[key].find(obj => obj.key === name).type;
        result.push({ title, name, options, type });
      } else {
        for (const filterKey in filterData[key]) {
          filterData[key][filterKey].forEach(entityType => {
              const title = entityType.label;
              const name = filterKey;
              const type = formData.filters.entity_types.find(obj => obj.key === name).type;
              const options = entityType.entities.map(entity => ({
                  id: entity.id,
                  label: entity.label,
                  value: entity.value
              }));
              result.push({ title, name, options, type });
          });
        }
      }
    }
    return result;
  }

  parseAndDownloadCSV(rawCSVData: string, fileName: string): void {
    Papa.parse(rawCSVData, {
      complete: (result) => {
        const csvContent = Papa.unparse(result.data);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const downloadLink = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(blob);
        downloadLink.download = fileName;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    });
  }

  async deviceDetails(){
    const browser = Bowser.getParser(window.navigator.userAgent);
    const metaData = {
      browserName: browser.getBrowserName(),
      browserVersion: browser.getBrowserVersion(),
      osName: browser.getOSName(),
      platformType: browser.getPlatformType(),
      type: ''
    }
    return JSON.stringify(metaData)
  }

  snakeToNormal(text: string): string {
    return text.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  async profileUpdatePopup(msg){
    let texts;
    this.translate.get([msg.header, msg.message, msg.cancel]).subscribe(text => {
      texts = text;
    })
      const alert = await this.alert.create({
        cssClass: 'my-custom-class',
        header: texts[msg.header],
        message: texts[msg.message],
        buttons: [
          {
            text: texts[msg.cancel],
            role: 'cancel',
            cssClass: 'alert-button-red'
          },
        ],
        backdropDismiss: false
      });
      await alert.present();
  }


  async transformToFilterData(responseData, obj) {
    const result = [];
    for (const key in responseData) {
      if (key !== 'entity_types') {
        const title = key.charAt(0).toUpperCase() + key.slice(1);
        const name = 'organization_ids';
        const options = responseData[key].map(item => ({
          id: item.value,
          label: item.name,
          value: item.id
        }));
        const type = "checkbox";
        result.push({ title, name, options, type });
      }
    }
    const entityTypes = responseData?.entity_types;
  
    const filterData = Object.keys(entityTypes).map(type => {
      const entityType = entityTypes[type][0];
      return {
        title: entityType.label,
        name: entityType.value,
        options: entityType.entities.map(entity => ({
          label: entity.label,
          value: entity.value
        })),
        type: "checkbox"
      };
    });
    const data = [...filterData, ...result]
    return data;
  }

  subscribeSearchText(searchText: string) {
    this.searchTextSource.next(searchText);
  }
  subscribeCriteriaChip(criteriaChip: string) {
    this.criteriaChipSource.next(criteriaChip);
  }
  
}
