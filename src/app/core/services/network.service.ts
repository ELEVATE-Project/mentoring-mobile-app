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
  network = Network; 
  constructor() {}

  public netWorkCheck() {
    this.getCurrentStatus();
    this.network.addListener('networkStatusChange', status => {
      this.isNetworkAvailable = status.connected;
    });
  }

  async getCurrentStatus() {
    let status = await this.network.getStatus();
    this.isNetworkAvailable = status.connected
  }

}