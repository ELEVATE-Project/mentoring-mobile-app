import { Injectable } from '@angular/core';
import { Share } from '@capacitor/share';
import { AlertController, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ISocialSharing } from '../../interface/soical-sharing-interface';
import { ModelComponent } from 'src/app/shared/components/model/model.component';
import * as Bowser from 'bowser';
import { BehaviorSubject, Subject } from 'rxjs';
import * as Papa from 'papaparse';
import { LocalStorageService } from '../localstorage.service';
import { environment } from 'src/environments/environment';

import { ToastService } from '../toast.service';

import { DynamicFormComponent, JsonFormData } from 'src/app/shared/components';
import { FormService } from '../form/form.service';
import * as _ from 'lodash-es';


@Injectable({
  providedIn: 'root',
})
export class UtilService {
  modal: any;
  public canIonMenuShow = new Subject<boolean>();
  public messageBadge = new Subject<boolean>();
  private searchTextSource = new BehaviorSubject<string>('');
  private criteriaChipSource = new BehaviorSubject<string>('');
  currentSearchText = this.searchTextSource.asObservable();
  currentCriteriaChip = this.criteriaChipSource.asObservable();

  ionMenuShow(data: boolean) {
    this.canIonMenuShow.next(data);
  }
  constructor(
    private modalCtrl: ModalController,
    private alert: AlertController,
    private translate: TranslateService,
    private localstorage: LocalStorageService,

    private toast: ToastService,

    private form : FormService
  ) {
    const browser = Bowser.getParser(window.navigator.userAgent);
  }

  getDeepLink(url) {
    return environment.deepLinkUrl + url;
  }

  async shareLink(param: ISocialSharing) {
    let { text, subject, link } = param;
    await Share.share({
      text: text,
      url: link,
      dialogTitle: subject,
    });
  }

  async openModal(componentProps) {
    this.modal = await this.modalCtrl.create({
      component: ModelComponent,
      componentProps: componentProps,
    });
    this.modal.present();
    const { data, role } = await this.modal.onWillDismiss();
  }

  async alertPopup(msg) {
    return new Promise(async (resolve) => {
      let texts: any;
      this.translate
        .get([msg.header, msg.message, msg.cancel, msg.submit])
        .subscribe((text) => {
          texts = text;
        });
      const alert = await this.alert.create({
        cssClass: 'custom-alert-with-close',
        header: texts[msg.header],
        message: texts[msg.message],
        inputs: msg.inputs || [],
        buttons: [
      {
        text: texts[msg.submit],
        cssClass: 'alert-button-bg-white',
        handler: (data) => {
          resolve(msg.inputs ? data : true);
        },
      },
      {
        text: texts[msg.cancel],
        role: 'cancel',
        cssClass: 'alert-button-red',
        handler: () => {
          resolve(false);
        },
      },
    ],
      });
      const headerEl = document.querySelector('.custom-alert-with-close .alert-head');
      if (headerEl) {
        const closeBtn = document.createElement('span');
        closeBtn.innerHTML = '&times;';
        closeBtn.className = 'close-alert-icon';
        closeBtn.onclick = () => alert.dismiss();
        headerEl.appendChild(closeBtn);
      }
      document.querySelector('.close-alert-icon')?.addEventListener('click', () => {
        alert.dismiss();
      });
      await alert.present();
    });
  }

  async alertClose() {
    this.alert.getTop().then((alertInstance) => {
      if (alertInstance) {
        alertInstance.dismiss();
      }
    });
  }

  getActionSheetButtons(profileImageData) {
    let texts;
    this.translate
      .get([
        'ADD_PHOTO',
        'REMOVE_CURRENT_PHOTO_LABEL',
        'CHOOSE_FROM_LIBRARY',
        'TAKE_PHOTO',
        'CANCEL',
      ])
      .subscribe((data) => {
        texts = data;
      });
    let buttons = [];
    let isMobile = this.isMobile();
    let removeCurrentPhotoValid = profileImageData.image ? true : false;
    switch (removeCurrentPhotoValid) {
      case true:
        buttons = [
          {
            text: texts['REMOVE_CURRENT_PHOTO_LABEL'],
            type: 'remove',
            action: 'remove',
          },
        ];
        break;
    }

    switch (isMobile) {
      case true:
        buttons.push({
          text: texts['TAKE_PHOTO'],
          type: 'CAMERA',
          action: 'camera',
        });
        break;
    }

    buttons.push({
      text: texts['CHOOSE_FROM_LIBRARY'],
      type: 'PHOTOLIBRARY',
      action: 'camera',
    });
    buttons.push({
      text: texts['CANCEL'],
      type: 'CANCEL',
      action: 'cancel',
    });
    return buttons;
  }

  isMobile() {
    return /iPhone|iPad|iPod|Android/i.test(window.navigator.userAgent);
  }

  getFormatedFilterData(filterData, formData) {
    const result = [];
    for (const key in filterData) {
      if (key !== 'entity_types') {
        const title = key.charAt(0).toUpperCase() + key.slice(1);
        const name = key;
        const options = filterData[key].map((item) => ({
          id: item.id,
          label: item.name,
          value: item.code,
        }));
        const type = formData.filters[key].find((obj) => obj.key === name).type;
        result.push({ title, name, options, type });
      } else {
        for (const filterKey in filterData[key]) {
          filterData[key][filterKey].forEach((entityType) => {
            const title = entityType.label;
            const name = filterKey;
            const type = formData.filters.entity_types.find(
              (obj) => obj.key === name
            ).type;
            const options = entityType.entities.map((entity) => ({
              id: entity.id,
              label: entity.label,
              value: entity.value,
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
      },
    });
  }

  async deviceDetails() {
    const browser = Bowser.getParser(window.navigator.userAgent);
    const metaData = {
      browserName: browser.getBrowserName(),
      browserVersion: browser.getBrowserVersion(),
      osName: browser.getOSName(),
      platformType: browser.getPlatformType(),
      type: '',
    };
    return JSON.stringify(metaData);
  }

  snakeToNormal(text: string): string {
    return text
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  async profileUpdatePopup(msg) {
    let texts;
    this.translate
      .get([msg.header, msg.message, msg.cancel])
      .subscribe((text) => {
        texts = text;
      });
    const alert = await this.alert.create({
      cssClass: 'my-custom-class',
      header: texts[msg.header],
      message: texts[msg.message],
      buttons: [
        {
          text: texts[msg.cancel],
          role: 'cancel',
          cssClass: 'alert-button-red',
        },
      ],
      backdropDismiss: false,
    });
    await alert.present();
  }

  async transformToFilterData(responseData, obj) {
    const result = [];
    for (const key in responseData) {
      if (key !== 'entity_types') {
        const title = key.charAt(0).toUpperCase() + key.slice(1);
        const name = 'organization_ids';
        const options = responseData[key].map((item) => ({
          id: item.value,
          label: item.name,
          value: item.id,
        }));
        const type = 'checkbox';
        result.push({ title, name, options, type });
      }
    }
    const entityTypes = responseData?.entity_types;

    const filterData = Object.keys(entityTypes).map((type) => {
      const entityType = entityTypes[type][0];
      return {
        title: entityType.label,
        name: entityType.value,
        options: entityType.entities.map((entity) => ({
          label: entity.label,
          value: entity.value,
        })),
        type: 'checkbox',
      };
    });
    const data = [...filterData, ...result];
    return data;
  }

  subscribeSearchText(searchText: string) {
    this.searchTextSource.next(searchText);
  }
  subscribeCriteriaChip(criteriaChip: string) {
    this.criteriaChipSource.next(criteriaChip);
  }

  addMessageBadge() {
    this.messageBadge.next(true);
  }
  removeMessageBadge() {
    this.messageBadge.next(false);
  }

  uploadFile(): Promise<File | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '*/*';
  
      input.addEventListener('change', (fileEvent: Event) => {
        const target = fileEvent.target as HTMLInputElement;
        const file = target.files?.[0];
  
        if (!file) {
          this.toast.showToast(
            this.translate.instant('No file selected'),
            'danger'
          );
          return resolve(null);
        }
  
        if (!file.type || file.type.trim() === '') {
          this.toast.showToast(
            this.translate.instant('Cannot upload file: File type is not detected. Please try a different file.'),
            'danger'
          );
          return resolve(null);
        }
  
        if (!file.name || file.name.trim() === '') {
          return resolve(null);
        }
  
        return resolve(file);
      });
  
      input.click();
    });
  }
  
async openFormModel(data, formType){
  console.log(data,"data");
  console.log(formType,"formData");

  const result = await this.form.getForm(formType);
  let formData = _.get(result, 'data.fields');

  let entityNames = await this.form.getEntityNames(formData);
  let entityList = await this.form.getEntities(entityNames, 'SESSION');
  let formDataJSON = await this.form.populateEntity(formData,entityList);
  for (let i = 0; i < formDataJSON.controls.length; i++) {
    formDataJSON.controls[i].value =
      data[formDataJSON.controls[i].name];
    if (formDataJSON.controls[i].type=='search' &&  formDataJSON.controls[i].meta.addPopupType !== 'file'){
      if(formDataJSON.controls[i].meta.multiSelect){
        formDataJSON.controls[i].meta.searchData = data[formDataJSON.controls[i].name]
        formDataJSON.controls[i].value = formDataJSON.controls[i].meta.searchData ? formDataJSON.controls[i].meta.searchData.map(obj => obj.id || obj.value) : [];
      } else {
        // formDataJSON.controls[i].meta.searchData = [{
        //   label: `${data.mentor_name}, ${data.organization.name}`,
        //   id: data[formDataJSON.controls[i].name]
        // }];
      }
   
    }else if (formDataJSON.controls[i].type === 'search' && formDataJSON.controls[i].meta.addPopupType === 'file') {
      const controlName = formDataJSON.controls[i].name;
      // if (data.resources?.length) {
      //   const filteredResources = data.resources
      //     .filter(resource => resource.type === controlName)
      //     .map(resource => 
      //       ({
      //         label: resource.name,
      //         id: resource.id,
      //         type: resource.type, 
      //         link: resource.link
      //       })
      //     );
      //     if(filteredResources){
      //       formDataJSON.controls[i].value = filteredResources.map(r => r);
      //       formDataJSON.controls[i].meta.searchData = filteredResources;
      //     }
      // }
      // if (!formDataJSON.controls[i].meta.disableIfSelected && data.status.value  !== "COMPLETED" &&  formDataJSON.controls[i].meta.addPopupType !== 'file') {
      //   formDataJSON.controls[i].disabled = false;
      // }
      // if (formDataJSON.controls[i].meta.disableIfSelected && formDataJSON.controls[i].value?.length && data.status.value  !== "COMPLETED") {
      //   formDataJSON.controls[i].disabled = true;
      // }
    }
    let dependedChildIndex = formDataJSON.controls.findIndex(formControl => formControl.name === formDataJSON.controls[i].dependedChild)
    if(formDataJSON.controls[i].dependedChild && formDataJSON.controls[i].name === 'type'){
      if(data[formDataJSON.controls[i].name].value){
        formDataJSON.controls[i].disabled = true;
        formDataJSON.controls[dependedChildIndex].validators['required']= data[formDataJSON.controls[i].name].value=='PUBLIC' ? false : true
      }
    }
    formDataJSON.controls[i].options = _.unionBy(
      formDataJSON.controls[i].options,
      formDataJSON.controls[i].value, 'value'
    );
  }
  
  this.modalCtrl.create({
    component: ModelComponent,
    componentProps: {
      data: formDataJSON,
      readonly: false
    },
    backdropDismiss: false
  }).then(modal => {
    modal.present();
  });
}
}
