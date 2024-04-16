import { Component, HostListener, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, MenuController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { AuthService, DbService, LocalStorageService, NetworkService, UserService, UtilService } from 'src/app/core/services';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { CommonRoutes } from 'src/global.routes';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { environment } from 'src/environments/environment';
import { Location } from '@angular/common';
import * as _ from 'lodash-es';
import { PermissionService } from '../../core/services/permission/permission.service';
import { permissionModule } from 'src/app/core/constants/permissionsConstant';
@Component({
  selector: 'app-private',
  templateUrl: './private.page.html',
  styleUrls: ['./private.page.scss'],
})
export class PrivatePage implements OnInit {
  user;
  public appPages = [
   { title: 'HOME', action: "home", icon: 'home', class:"hide-on-small-screen" , url: CommonRoutes.TABS+'/'+CommonRoutes.HOME},
   { title: 'MENTORS', action: "mentor-directory", icon: 'people', class:"hide-on-small-screen", url: CommonRoutes.TABS+'/'+CommonRoutes.MENTOR_DIRECTORY},
   { title: 'DASHBOARD', action: "dashboard", icon: 'stats-chart', class:"hide-on-small-screen", url: CommonRoutes.TABS+'/'+CommonRoutes.DASHBOARD },
   { title: 'HELP', action: "help", icon: 'help-circle', url: CommonRoutes.HELP},
   { title: 'FAQ', action: "faq", icon: 'alert-circle', url: CommonRoutes.FAQ},
   { title: 'HELP_VIDEOS', action: "help videos", icon: 'videocam',url: CommonRoutes.HELP_VIDEOS },
   { title: 'LANGUAGE', action: "selectLanguage", icon: 'language', url: CommonRoutes.LANGUAGE },
   { title: 'CHANGE_PASSWORD', action: 'change-password', icon: 'key', url: CommonRoutes.CHANGE_PASSWORD},
   { title: 'LOGIN_ACTIVITY', action: 'login-activity', icon: 'time', url: CommonRoutes.LOGIN_ACTIVITY}
 ];
 
  adminPage = {title: 'ADMIN_WORKSPACE', action: "admin", icon: 'briefcase' ,class:'', url: CommonRoutes.ADMIN+'/'+CommonRoutes.ADMIN_DASHBOARD}
 
  actionsArrays: any[] = permissionModule.MODULES;
 
   isMentor:boolean
   showAlertBox = false;
   userRoles: any;
   userEventSubscription: any;
   backButtonSubscription: any;
   menuSubscription: any;
   routerSubscription: any;
   adminAccess: boolean;
  constructor(
    private translate: TranslateService,
    private platform: Platform,
    private localStorage: LocalStorageService,
    public menuCtrl: MenuController,
    private userService: UserService,
    private utilService: UtilService,
    private db: DbService,
    private router: Router,
    private network: NetworkService,
    private authService: AuthService,
    private profile: ProfileService,
    private zone: NgZone,
    private _location: Location,
    private alert: AlertController,
    private permissionService: PermissionService,
  ) {
    this.initializeApp()
  }

  ngOnInit() {
  }

 subscribeBackButton() {
   this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(10,async () => {
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
             cssClass: "alert-button-bg-white",
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
         ]       });
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
       this.setHeader();
       this.localStorage.getLocalData(localKeys.USER_DETAILS).then((userDetails)=>{
         if(userDetails) {
           this.profile.getUserRole(userDetails)
           this.adminAccess = userDetails.permissions ? this.permissionService.hasAdminAcess(this.actionsArrays,userDetails?.permissions) : false;
         }
         this.getUser();
       })
     },0)
     this.db.init();
     setTimeout(async ()=>{
       this.userRoles = await this.localStorage.getLocalData(localKeys.USER_ROLES);
     },1000);
     setTimeout(() => {
       document.querySelector('ion-menu')?.shadowRoot?.querySelector('.menu-inner')?.setAttribute('style', 'border-radius:8px 8px 0px 0px');
     }, 2000);

     this.userEventSubscription = this.userService.userEventEmitted$.subscribe(data=>{
       if(data){
         this.isMentor = this.profile.isMentor
         this.user = data;
         this.adminAccess = data.permissions ? this.permissionService.hasAdminAcess(this.actionsArrays,data?.permissions) : false;
       }
     })
     App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
       this.zone.run(() => {
         const domain = environment.deepLinkUrl
         const slug = event.url.split(domain).pop();
         if (slug) {
           this.router.navigateByUrl(slug);
         }
       });
   });
   });
   this.subscribeBackButton();
 }
 setHeader() {
   this.userService.getUserValue();
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
      await this.authService.logoutAccount();
      this.menuCtrl.enable(false);
    }
  }).catch(error => {})
}

getUser() {
  this.profile.profileDetails(false).then(profileDetails => {
    this.adminAccess = profileDetails.permissions ? this.permissionService.hasAdminAcess(this.actionsArrays,profileDetails?.permissions) : false;
    this.user = profileDetails;
    this.isMentor = this.profile.isMentor;
  })
}
goToProfilePage(){
  this.menuCtrl.toggle();
  this.router.navigate([`${CommonRoutes.TABS}/${CommonRoutes.PROFILE}`]);
}

async menuItemAction(menu) {
  this.router.navigate([menu.url]);
}

ngOnDestroy(): void {
  if (this.userEventSubscription) {
    this.userEventSubscription.unsubscribe();
  }
  if (this.backButtonSubscription) {
    this.backButtonSubscription.unsubscribe();
  }
  if (this.menuSubscription) {
    this.menuSubscription.unsubscribe();
  }
  if (this.routerSubscription) {
    this.routerSubscription.unsubscribe();
  }
}
}