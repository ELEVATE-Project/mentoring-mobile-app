import { Injectable } from '@angular/core';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Action } from 'rxjs/internal/scheduler/Action';
import { environment } from 'src/environments/environment';
import { ISocialSharing } from '../../interface/soical-sharing-interface';

@Injectable({
  providedIn: 'root',
})
export class UtilService {
  constructor(
    private socialSharing: SocialSharing,
    private alert: AlertController,
    private translate: TranslateService
  ) {}

  getDeepLink(url){
    return environment.deepLinkUrl+url;
  }

  shareLink(param:ISocialSharing) {
    let {text,subject,link} = param;
    this.socialSharing.share(text,subject,null,link);
  }

  shareFile(param:ISocialSharing) {
    let {file,text} = param;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      let base64: any = reader.result;
      this.socialSharing
        .share(text, file.name, base64,null)
        .then(() => {
        })
        .catch(() => {
        });
    };
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
            text: texts[msg.cancel],
            role: 'cancel',
            cssClass: 'alert-button-white',
            handler: (blah) => {
              resolve(false);
            }
          }, {
            text: texts[msg.submit],
            cssClass: 'alert-button-red',
            handler: () => {
              resolve(true);
            }
          }
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
        "REMOVE_CURRENT_PHOTO",
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

    switch (type) {
      case 'profile':
        buttons = [
          {
            text: texts["REMOVE_CURRENT_PHOTO"],
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
      case 'session':
        buttons = [
           {
            text: texts["REMOVE_CURRENT_PHOTO"],
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
