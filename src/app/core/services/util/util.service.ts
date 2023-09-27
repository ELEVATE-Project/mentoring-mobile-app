import { Injectable } from '@angular/core';
import { Share } from '@capacitor/share';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Action } from 'rxjs/internal/scheduler/Action';
import { environment } from 'src/environments/environment';
import { ISocialSharing } from '../../interface/soical-sharing-interface';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class UtilService {
  constructor(
    // private socialSharing: SocialSharing,
    private alert: AlertController,
    private translate: TranslateService
  ) {}

  getDeepLink(url){
    return environment.deepLinkUrl+url;
  }

  async shareLink(param:ISocialSharing) {
    let {text,subject,link} = param;
    await Share.share({
      text: text,
      url: link,
      dialogTitle: subject,
    });
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

  getActionSheetButtons(type) {
    let texts
    this.translate
      .get([
        "ADD_PHOTO",
        "REMOVE_CURRENT_PHOTO_LABEL",
        "CHOOSE_FROM_LIBRARY",
        "TAKE_PHOTO",
        "CANCEL",
        "ERROR_WHILE_STORING_FILE",
        "SUCCESSFULLY_ATTACHED"
      ])
      .subscribe((data) => {
        texts = data;
      });
    let buttons = []

    switch (Capacitor.isNativePlatform()) {
      case true:
        buttons = [
          {
            text: texts["REMOVE_CURRENT_PHOTO_LABEL"],
            type: 'remove',
            action: 'remove'
          },
          {
            text: texts["TAKE_PHOTO"],
            type: 'CAMERA',
            action: 'camera'
          }
        ]
        break;
      case false:
        buttons = [
           {
            text: texts["REMOVE_CURRENT_PHOTO_LABEL"],
            type: 'remove',
            action: 'remove'
          }
        ]
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
}
