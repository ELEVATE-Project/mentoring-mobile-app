import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  loaderRef: any;
  isLoading: boolean = false;
  loaderCounter = 0;
  loading: HTMLIonLoadingElement;

  constructor(private loadingController: LoadingController) {}

  async startLoader(message?) {
      this.loading = await this.loadingController.create({
        cssClass: 'custom-loader-message-class',
        spinner: 'circular',
        message: message ? message : 'Please wait while loading ...',
        translucent: true,
        backdropDismiss: false,
      });
      await this.loading.present();
  }

  async stopLoader() {
      await this.loading.dismiss();
  }
}
