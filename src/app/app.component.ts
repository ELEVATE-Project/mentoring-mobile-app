import { Component, NgZone } from '@angular/core';
import { AlertController, MenuController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { localKeys } from './core/constants/localStorage.keys';
import * as _ from 'lodash-es';
import { UtilService,DbService,UserService,LocalStorageService,AuthService,NetworkService} from './core/services';
import { CommonRoutes } from 'src/global.routes';
import { Router} from '@angular/router';
import { ProfileService } from './core/services/profile/profile.service';
import { Location } from '@angular/common';
import { Deeplinks } from '@awesome-cordova-plugins/deeplinks/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
 user;
 public appPages = [
  { title: 'HELP', action: "help", icon: 'help-circle', url: CommonRoutes.HELP},
  { title: 'FAQ', action: "faq", icon: 'alert-circle', url: CommonRoutes.FAQ},
  { title: 'HELP_VIDEOS', action: "help videos", icon: 'videocam',url: CommonRoutes.HELP_VIDEOS },
  { title: 'LANGUAGE', action: "selectLanguage", icon: 'language', url: CommonRoutes.LANGUAGE },
];


  isMentor:boolean
  showAlertBox = false;
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
    private deeplinks: Deeplinks,
    private authService:AuthService,
    private profile: ProfileService,
    private zone:NgZone,
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
              cssClass: "alert-button",
              handler: () => { }
            },
            {
              text: texts['CONFIRM'],
              role: 'confirm',
              cssClass: "alert-button",
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
      this.network.netWorkCheck();
      setTimeout(async ()=>{
        this.languageSetting();
      },0)
      this.db.init();
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
        '/mentor-details/:id': '',
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
    this.utilService.alertPopup(msg).then(async (data) => {
      if(data){
        await this.localStorage.setLocalData(localKeys.SELECTED_LANGUAGE, "en");
        this.translate.use("en")
        this.authService.logoutAccount();
      }
    }).catch(error => {})
  }
  
  getUser() {
    this.profile.profileDetails(false).then(profileDetails => {
      this.user = profileDetails;
      this.isMentor = this.user?.isAMentor
    })
  }
  goToProfilePage(){
    this.menuCtrl.close();
    this.router.navigate([`${CommonRoutes.TABS}/${CommonRoutes.PROFILE}`]);
  }

  async menuItemAction(menu) {
    switch (menu.title) {
      case 'LANGUAGE': {
        this.alert.create({
          
        })
        break;
      }
      case 'CREATED_BY_ME': {
        this.router.navigate([`${CommonRoutes.CREATED_BY_ME}`]);
        break;
      }
    }
  }

  async showAlert(alertData){
    
  }

}
