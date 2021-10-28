import { Component } from '@angular/core';
import { MenuController, NavController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { CommonRoutes } from 'src/global.routes';
import { localKeys } from './core/constants/localStorage.keys';
import { urlConstants } from './core/constants/urlConstants';
import { AuthService, HttpService, LoaderService } from './core/services';
import { LocalStorageService } from './core/services/localstorage.service';
import * as _ from 'lodash-es';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
 
  public appPages = [
    { title: 'CREATED_SESSIONS', url: '', icon: 'person-add' },
    { title: 'LANGUAGE', url: '', icon: 'language' },
    { title: 'SETTINGS', url: '', icon: 'settings' },
    { title: 'HELP', url: '', icon: 'help-circle' }
  ];
  userDetails:any;
  constructor(
    private translate :TranslateService,
    private platform : Platform,
    private localStorage: LocalStorageService,
    private navCtrl:NavController,
    private loaderService:LoaderService,
    private httpService:HttpService,
    public menuCtrl:MenuController,
    private authService:AuthService
  ) {
    this.initializeApp();
  }


  initializeApp() {
    this.platform.ready().then(() => {
      this.authService.getUserValue();
      this.languageSetting();
      setTimeout(() => {
        document.querySelector('ion-menu').shadowRoot.querySelector('.menu-inner').setAttribute('style', 'border-radius:8px 8px 0px 0px');
      }, 2000);
    });
  }
  languageSetting() {
    this.translate.setDefaultLang('en');
    this.localStorage.getLocalData(localKeys.SELECTED_LANGUAGE).then(data =>{
      if(data){
        this.translate.use(data);
      }
    }).catch(error => {
      this.setLanguage('en');
    })
  }

  setLanguage(lang){
    this.localStorage.setLocalData(localKeys.SELECTED_LANGUAGE,'en').then(data =>{
      this.translate.use(lang);
    }).catch(error => {
    })
  }

  getUserDetail(){
    this.authService.user.subscribe((data) => this.userDetails = data);
    console.log(this.userDetails);
  }

  async logout(){
    await this.getUserDetail();
    await this.loaderService.startLoader();
    this.menuCtrl.toggle();
    const config = {
      url:
        urlConstants.API_URLS.LOGOUT_ACCOUNT,
      payload:{
        refreshToken:_.get(this.userDetails,'refresh_token')
      }
    };
    this.httpService.post(config)
      .then((data: any) => {
        if (data.responseCode === "OK") {
          this.localStorage.deleteAll();
          this.authService.userSubject.next(null);
          this.authService.authState.next(false);
          this.languageSetting();
          this.loaderService.stopLoader();
          this.navCtrl.navigateRoot(`/${CommonRoutes.AUTH}/${CommonRoutes.LOGIN}`);
        }
        else {
          this.loaderService.stopLoader();
        }
      })
  }

}
