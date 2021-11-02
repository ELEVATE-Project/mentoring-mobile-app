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

      async showToast(msg, color) {
        let toast = await this.toastCtrl.create({
            message: msg,
            color:color,
            duration: 2000,
            position: 'top',
          });
          toast.present();
      }
}