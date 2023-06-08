import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
    constructor(
        private toastCtrl: ToastController,
        private translate : TranslateService
      ) { }

      async showToast(msg, color , duration= 5000,toastButton = []) {
        let texts;
        this.translate.get([msg]).subscribe(resp =>{
          texts = resp;
        })
        let toast = await this.toastCtrl.create({
            message: texts[msg],
            color:color,
            duration: duration,
            position: 'top',
            buttons: toastButton,
            cssClass: 'custom-toast'
          });
          toast.present();
      }
}