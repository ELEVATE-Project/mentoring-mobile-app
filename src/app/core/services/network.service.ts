import { Injectable } from '@angular/core';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import { Subject } from 'rxjs';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  connectSubscription;
  disconnectSubscription;
  isNetworkAvailable: boolean = false;
  constructor(private network: Network, private toastService: ToastService) {}

  public netWorkCheck() {
    this.getCurrentStatus();
    this.disconnectSubscription = this.network.onDisconnect()
      .subscribe(() => {
        this.isNetworkAvailable = false;
      });
    this.connectSubscription = this.network.onConnect().subscribe(() => {
      this.isNetworkAvailable = true;
    });
  }


  public getCurrentStatus() {
    this.isNetworkAvailable = (this.network.type === 'none') ? false : true;
  }

}
