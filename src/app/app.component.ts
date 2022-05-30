import { Component, NgZone } from '@angular/core';
import { AlertController, MenuController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { localKeys } from './core/constants/localStorage.keys';
import * as _ from 'lodash-es';
import { UtilService,DbService,UserService,LocalStorageService,AuthService,NetworkService } from './core/services';
import { CommonRoutes } from 'src/global.routes';
import { Router } from '@angular/router';
import { ProfileService } from './core/services/profile/profile.service';
import { Deeplinks } from '@ionic-native/deeplinks/ngx';
import { Location } from '@angular/common';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
 user;
  public appPages = [
    { title: 'CREATED_SESSIONS', url: `${CommonRoutes.CREATED_BY_ME}`, icon: 'person-add' },
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
    private userService:UserService,
    private utilService:UtilService,
    private db:DbService,
    private router: Router,
    private network:NetworkService,
    private authService:AuthService,
    private profile: ProfileService,
    private zone:NgZone,
    private deeplinks: Deeplinks,
    private _location: Location,
    private alert: AlertController,
  ) {
    this.initializeApp();
    this.router.navigate(["/"]);
  }
  subscribeBackButton() {
    this.platform.backButton.subscribeWithPriority(10,async () => {
      if (this._location.isCurrentPathEqualTo("/tabs/home")){
        let texts: any;
        this.translate.get(['EXIT_CONFIRM_MESSAGE', 'CANCEL', 'CONFIRM']).subscribe(text => {
          texts = text;
        })
        const alert = await this.alert.create({
          message: texts['EXIT_CONFIRM_MESSAGE'],
          buttons: [
            {
              text: texts['CANCEL'],
              role: 'cancel',
              handler: () => { }
            },
            {
              text: texts['CONFIRM'],
              role: 'confirm',
              handler: () => { 
                navigator['app'].exitApp();
              }
            }
          ]
        });
        await alert.present();
      } else {
        this._location.back();
      }
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      setTimeout(async ()=>{
        this.languageSetting();
      },0)
      this.db.init();
      this.network.netWorkCheck();
      setTimeout(async ()=>{
        const userDetails = await this.localStorage.getLocalData(localKeys.USER_DETAILS);
        if(userDetails){
          this.getUser();
        }
      },1000);
      setTimeout(() => {
        document.querySelector('ion-menu').shadowRoot.querySelector('.menu-inner').setAttribute('style', 'border-radius:8px 8px 0px 0px');
      }, 2000);

      this.userService.userEventEmitted$.subscribe(data=>{
        if(data){
          this.isMentor = data?.isAMentor;
          this.user = data;
        }
      })
      this.deeplinks.route({
        '/sessions/details/:id': '',
      }).subscribe(match=>{
        this.zone.run(()=>{
          this.router.navigateByUrl(match.$link.path);
        })  
      })

    });
    this.subscribeBackButton();
  }
  languageSetting() {
    this.localStorage.getLocalData(localKeys.SELECTED_LANGUAGE).then(data =>{
      if(data){
        this.translate.use(data);
      } else {
      this.setLanguage('en');
      }
    }).catch(error => {
      this.setLanguage('en');
    })
  }

  setLanguage(lang){
    this.localStorage.setLocalData(localKeys.SELECTED_LANGUAGE,lang).then(data =>{
      this.translate.use(lang);
    }).catch(error => {
      this.translate.use(lang)
    })
  }

  logout(){
    this.menuCtrl.toggle();
    let msg = {
      header: 'LOGOUT',
      message: 'LOGOUT_CONFIRM_MESSAGE',
      cancel:'CANCEL',
      submit:'LOGOUT'
    }
    this.utilService.alertPopup(msg).then(data => {
      if(data){
        this.authService.logoutAccount();
      }
    }).catch(error => {})
  }
  
  getUser() {
    this.profile.profileDetails(false).then(profileDetails => {
      this.user = profileDetails;
      this.isMentor = this.user?.isAMentor;
    })
  }
  goToProfilePage(){
    this.menuCtrl.close();
    this.router.navigate([`${CommonRoutes.TABS}/${CommonRoutes.PROFILE}`]);
  }

}
