import { Injectable } from '@angular/core';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Action } from 'rxjs/internal/scheduler/Action';
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
            cssClass: 'secondary',
            handler: (blah) => {
              resolve(false);
            }
          }, {
            text: texts[msg.submit],
            handler: () => {
              resolve(true);
            }
          }
        ]
      });
      await alert.present();
    });
  }
}
