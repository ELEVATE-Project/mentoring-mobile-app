import { Injectable } from '@angular/core';
import { Network } from '@capacitor/network';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  connectSubscription;
  disconnectSubscription;
  isNetworkAvailable: boolean = false;
  constructor() {}

  public netWorkCheck() {
    this.getCurrentStatus();
    Network.addListener('networkStatusChange', status => {
      this.isNetworkAvailable = status.connected;
    });
  }

  getCurrentStatus() {
    Network.getStatus().then((status)=>{
      this.isNetworkAvailable = status.connected
    })
  }

}
