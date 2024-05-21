
import { Injectable } from '@angular/core';
import { Network, NetworkStatus } from '@capacitor/network';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  isNetworkAvailable: boolean = false;

  constructor() {
    // Initialize network status and set up the listener
    this.initializeNetworkListener();
  }

  public async netWorkCheck() {
    await this.getCurrentStatus();
  }

  public async getCurrentStatus() {
    const status = await Network.getStatus();
    this.updateNetworkStatus(status);
  }

  private initializeNetworkListener() {
    Network.addListener('networkStatusChange', this.updateNetworkStatus.bind(this));
  }

  private updateNetworkStatus(status: NetworkStatus) {
    this.isNetworkAvailable = status.connected;
  }
}

