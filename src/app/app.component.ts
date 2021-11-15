import { Component } from '@angular/core';
import { MenuController, NavController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { localKeys } from './core/constants/localStorage.keys';
import { LocalStorageService } from './core/services/localstorage.service';
import * as _ from 'lodash-es';
import { UserService } from './core/services/user/user.service';
import { AuthService, DbService, NetworkService } from './core/services';
import { CommonRoutes } from 'src/global.routes';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
 
  public appPages = [
    { title: 'CREATED_SESSIONS', url: `${CommonRoutes.CREATED_BY_ME}`, icon: 'person-add' },
    { title: 'LANGUAGE', url: '', icon: 'language' },
    { title: 'SETTINGS', url: '', icon: 'settings' },
    { title: 'HELP', url: '', icon: 'help-circle' }
  ];

  public mentorMenu=[
    'CREATED_SESSIONS',
  ]

  isMentor:boolean
  constructor(
    private translate :TranslateService,
    private platform : Platform,
    private localStorage: LocalStorageService,
    public menuCtrl:MenuController,
    private userService: UserService,
    private db:DbService,
    private router: Router,
    private network:NetworkService,
    private authService:AuthService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.db.init();
      this.network.netWorkCheck();
      setTimeout(()=>{
        this.languageSetting();
      },1000);
      setTimeout(() => {
        document.querySelector('ion-menu').shadowRoot.querySelector('.menu-inner').setAttribute('style', 'border-radius:8px 8px 0px 0px');
      }, 2000);

      this.userService.getUserValue().then((result) => {
        console.log(result);
        this.isMentor = result?.user?.isAMentor;
      });

    });
  }
  languageSetting() {
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

  logout(){
    this.menuCtrl.toggle();
    this.authService.logoutAccount();
  }

}
