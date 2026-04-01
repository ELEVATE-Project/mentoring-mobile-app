import { Injectable } from '@angular/core';
import { Share } from '@capacitor/share';
import { AlertController, IonContent, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ISocialSharing } from '../../interface/soical-sharing-interface';
import { ModelComponent } from 'src/app/shared/components/model/model.component';
import Bowser from 'bowser';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import * as Papa from 'papaparse';
import { LocalStorageService } from '../localstorage.service';
import { environment } from 'src/environments/environment';

import { ToastService } from '../toast.service';
import * as moment from 'moment-timezone';


@Injectable({
  providedIn: 'root',
})
export class UtilService {
  modal: any;
  private skipScrollMap: Record<string, boolean> = {};
  public canIonMenuShow = new Subject<boolean>();
  public messageBadge = new Subject<boolean>();
  private searchTextSource = new BehaviorSubject<string>('');
  private criteriaChipSource = new BehaviorSubject<string>('');
  currentSearchText = this.searchTextSource.asObservable();
  currentCriteriaChip = this.criteriaChipSource.asObservable();
  private hasBadgeSubject = new BehaviorSubject<boolean>(false);
  hasBadge$: Observable<boolean> = this.hasBadgeSubject.asObservable();

  ionMenuShow(data: boolean) {
    this.canIonMenuShow.next(data);
  }

  setSkipScroll(key: string): void {
    this.skipScrollMap[key] = true;
  }

  handleScrollOnEnter(key: string, content?: IonContent, duration = 1000): void {
    if (this.skipScrollMap[key]) {
      this.skipScrollMap[key] = false;
      return;
    }
    content?.scrollToTop(duration);
  }
  constructor(
    private modalCtrl: ModalController,
    private alert: AlertController,
    private translate: TranslateService,
    private localstorage: LocalStorageService,
    private toast: ToastService,
  ) {
    const browser = Bowser.getParser(window.navigator.userAgent);
  }

  getDeepLink(url) {
    const baseUrl = window.location.origin;
    return baseUrl + url;
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

  async alertPopup(msg, parameters? : any) {
    return new Promise(async (resolve) => {
      let texts: any;
      this.translate
        .get([msg.header, msg.message, msg.cancel, msg.submit], parameters)
        .subscribe((text) => {
          texts = text;
        });
        const buttons = msg.swapButtons
      ? [
          {
            text: texts[msg.cancel],
            role: 'cancel',
            cssClass: 'alert-button-bg-white', 
            handler: () => resolve(false),
          },
          {
            text: texts[msg.submit],
            cssClass: 'alert-button-red',
            handler: (data) => {
          resolve(msg.inputs ? data : true);
        },

          },
        ]
      : [
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
            handler: () => resolve(false),
          },
        ];
      const alert = await this.alert.create({
        cssClass: 'custom-alert-with-close',
        header: texts[msg.header],
        message: texts[msg.message],
        inputs: msg.inputs || [],
        buttons: buttons
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
          value: item.id,
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

async downloadFile(fileUrl: string, fileName: string, mimeType?: string): Promise<void> {
  try {
    const response = await fetch(fileUrl);
    let contentType: string;
    let fileExtension: string;
    
    if (!mimeType || mimeType.includes('csv') || fileName.endsWith('.csv')) {
      contentType = 'text/csv;charset=utf-8;';
      fileExtension = '.csv';
    }
    else if (mimeType.includes('pdf')) {
      contentType = 'application/pdf';
      fileExtension = '.pdf';
    }
    else if (mimeType.includes('word') || mimeType.includes('.document') || mimeType.includes('docx')) {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      fileExtension = '.docx';
    }
    else if (mimeType.includes('presentation') || mimeType.includes('powerpoint') || mimeType.includes('pptx')) {
      contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      fileExtension = '.pptx';
    }
    else {
      contentType = 'application/octet-stream';
      fileExtension = '';
    }
    
    const blob = await response.blob();
    const typedBlob = new Blob([blob], { type: contentType });
    const url = URL.createObjectURL(typedBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName.includes('.') ? fileName : `${fileName}${fileExtension}`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    console.error('Error downloading file:', error);
  }
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

 uploadFile(allowedExtensions?: string[], maxSizeMB?: number, errorMsgs?:any): Promise<File | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      const extensions = allowedExtensions && allowedExtensions.length > 0
        ? allowedExtensions.map(ext => `.${ext}`).join(',')
        : '*/*';
      input.accept = extensions;
      input.addEventListener('change', (fileEvent: Event) => {
        const target = fileEvent.target as HTMLInputElement;
        const file = target.files?.[0];
  
        if (!file) {
          this.toast.showToast('No file selected', 'danger');
          return resolve(null);
        }
        if (allowedExtensions && allowedExtensions.length > 0) {
          const fileName = file.name;
          const fileExt = fileName.split('.').pop()?.toLowerCase();
  
          if (!fileExt || !allowedExtensions.includes(fileExt)) {
            this.toast.showToast(
              errorMsgs?.invalidFormatError,
              'danger'
            );
            return resolve(null);
          }
        }
        if (maxSizeMB) {
          const maxSizeBytes = maxSizeMB * 1024 * 1024;
          if (file.size > maxSizeBytes) {
            this.toast.showToast(
              errorMsgs?.maxSizeError,
              'danger'
            );
            return resolve(null);
          }
        }
        return resolve(file);
      });
      input.click();
    });
  }

  isSessionExpired(meta): boolean {
  const endDate = meta?.resp?.end_date;
  if (!endDate) return false; 
  return Date.now() > endDate * 1000;
  }

  setHasBadge(value: boolean): void {
    this.hasBadgeSubject.next(value);
  }


  convertDatesToTimezone(startDate, endDate, selectedTimezone) {
  // Guess user's current timezone
  const userTimezone = moment.tz.guess();
  
  // Parse dates in user's timezone
  const startDateTimezoned = moment.tz(startDate, userTimezone);
  const endDateTimezoned = moment.tz(endDate, userTimezone);
  
  // Get current time in selected timezone
  const currentTimeInSelectedTZ = moment.tz(selectedTimezone);
  const currentEpochInSelectedTZ = currentTimeInSelectedTZ.valueOf();
  
  // Extract time components from original dates
  const startDatehours = startDateTimezoned.hours();
  const startDateminutes = startDateTimezoned.minutes();
  const startDateseconds = startDateTimezoned.seconds();
  const startDay = startDateTimezoned.date(); 
  const startMonth = startDateTimezoned.month(); 
  const startYear = startDateTimezoned.year(); 

  const endDay = endDateTimezoned.date();
  const endMonth = endDateTimezoned.month();
  const endYear = endDateTimezoned.year();
  const endDatehours = endDateTimezoned.hours();
  const endDateminutes = endDateTimezoned.minutes();
  const endDateseconds = endDateTimezoned.seconds();
  
  // Create new dates with the SAME TIME but in the selected timezone
 const eventStartDateInSelectedTZ = moment.tz(selectedTimezone)
    .year(startYear)
    .month(startMonth)
    .date(startDay)
    .hours(startDatehours)
    .minutes(startDateminutes)
    .seconds(startDateseconds)
    .milliseconds(0);

const eventEndDateInSelectedTZ = moment.tz(selectedTimezone)
    .year(endYear)
    .month(endMonth)
    .date(endDay)
    .hours(endDatehours)
    .minutes(endDateminutes)
    .seconds(endDateseconds)
    .milliseconds(0);


  // Get the epoch milliseconds
  const eventStartEpochInSelectedTZ = eventStartDateInSelectedTZ.valueOf();
  const eventEndEpochInSelectedTZ = eventEndDateInSelectedTZ.valueOf();
  
  return {
    eventStartEpochInSelectedTZ,
    eventEndEpochInSelectedTZ,
  };
}
  
}
