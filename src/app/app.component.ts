import { Component, HostListener } from '@angular/core';
import * as _ from 'lodash-es';
import { UtilService } from 'src/app/core/services';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { SwUpdate } from '@angular/service-worker';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private utilService:UtilService,
    private screenOrientation: ScreenOrientation,
    private swUpdate: SwUpdate,
  ) {
    if(Capacitor.isNativePlatform()){
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT); 
    }
    window['env']['baseUrl'] = localStorage.getItem('baseUrl') ? localStorage.getItem('baseUrl') : window['env']['baseUrl'];
  }

  ngOnInit(){
    if (this.swUpdate.isEnabled) {
      this.swUpdate.checkForUpdate().then((data) => {
        if(data){
          this.swUpdate.activateUpdate().then((data)=>{
            window.location.reload()
          })
        }
      });
    }
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event: any) {
    this.utilService.alertClose()
  }
}
