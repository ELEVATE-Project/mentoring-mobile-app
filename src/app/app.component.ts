import { Component, HostListener, NgZone } from '@angular/core';
import { AlertController, MenuController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { localKeys } from './core/constants/localStorage.keys';
import * as _ from 'lodash-es';
import { UtilService,DbService,UserService,LocalStorageService,AuthService,NetworkService} from './core/services';
import { CommonRoutes } from 'src/global.routes';
import { Router, NavigationEnd} from '@angular/router';
import { ProfileService } from './core/services/profile/profile.service';
import { Location } from '@angular/common';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { environment } from 'src/environments/environment';
import { Capacitor } from '@capacitor/core';
import { SwUpdate } from '@angular/service-worker';
import { PermissionService } from './core/services/permission/permission.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  showMenu: boolean = false;
 user;
 public appPages = [
  { title: 'HOME', action: "home", icon: 'home', class:"hide-on-small-screen" , url: CommonRoutes.TABS+'/'+CommonRoutes.HOME, active: false, childrens : ['session-detail', 'home-search']},
  { title: 'MENTORS', action: "mentor-directory", icon: 'people', class:"hide-on-small-screen", url: CommonRoutes.TABS+'/'+CommonRoutes.MENTOR_DIRECTORY, active: false, childrens : ['mentor-profile', 'mentor-directory?search']},
  { title: 'DASHBOARD', action: "dashboard", icon: 'stats-chart', class:"hide-on-small-screen", url: CommonRoutes.TABS+'/'+CommonRoutes.DASHBOARD, active: false},
  { title: 'HELP', action: "help", icon: 'help-circle', url: CommonRoutes.HELP, active: false},
  { title: 'FAQ', action: "faq", icon: 'alert-circle', url: CommonRoutes.FAQ, active: false},
  { title: 'HELP_VIDEOS', action: "help videos", icon: 'videocam',url: CommonRoutes.HELP_VIDEOS , active: false},
  { title: 'LANGUAGE', action: "selectLanguage", icon: 'language', url: CommonRoutes.LANGUAGE, active: false },
];

 adminPage = {title: 'ADMIN_WORKSPACE', action: "admin", icon: 'briefcase' ,class:'', url: CommonRoutes.ADMIN+'/'+CommonRoutes.ADMIN_DASHBOARD, active:false, childrens : ['manage-user', 'manage-session', 'admin']}


  isMentor:boolean
  isOrgAdmin:boolean
  showAlertBox = false;
  userRoles: any;
  userEventSubscription: any;
  backButtonSubscription: any;
  menuSubscription: any;
  routerSubscription: any;
  activeUrl : string;
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
    private _location: Location,
    private alert: AlertController,
    private screenOrientation: ScreenOrientation,
    private swUpdate: SwUpdate,
    private permissionService: PermissionService
  ) {
    this.menuSubscription = this.utilService.canIonMenuShow.subscribe(data =>{
        this.showMenu = data
      }
    );
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.showMenu = this.shouldHideMenu(event.url);
      }
    });
    this.initializeApp();
    if(Capacitor.isNativePlatform()){
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT); 
    }
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
    this.permissionService.fetchPermissions();
    this.setActiveTab();
  }
  
  shouldHideMenu(url: string): boolean {
     if(url.includes('/auth')){
      return false;
     }else{
       return true
     }
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
            this.isOrgAdmin = this.profile.isOrgAdmin;
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
          this.isOrgAdmin = this.profile.isOrgAdmin;
          this.isMentor = this.profile.isMentor
          this.user = data;
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
      this.isOrgAdmin = this.profile.isOrgAdmin;
      this.user = profileDetails;
      this.isMentor = this.profile.isMentor;
    })
  }
  goToProfilePage(){
    this.menuCtrl.toggle();
    this.router.navigate([`${CommonRoutes.TABS}/${CommonRoutes.PROFILE}`]);
  }

  async menuItemAction(menu) {
    this.appPages.forEach((element) => {
      element.active = false
    })
    menu.active = true
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

  setActiveTab() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.activeUrl = this.router.url.substring(1);
        //using the children array from apppage object
        this.appPages.forEach((element) => {
          let checkUrl = [];
          switch (true) {
            case (element.childrens && element.childrens.length > 0):
              element.childrens.forEach((el) => {
                checkUrl.push(el);
              });
              const isChildActive = checkUrl.some((child) => this.activeUrl.includes(child));
              element.active = (isChildActive && (element.title === 'MENTORS' || element.title === 'HOME') ) || (this.activeUrl === element.url)
              break;
            default:
              element.active = this.activeUrl === element.url;
          }
        });
        let adminUrl = [];
        this.adminPage.childrens.forEach((el) => {
          adminUrl.push(el);
        });
        const isAdminChildActive = adminUrl.some((child) => this.activeUrl.includes(child));
        this.adminPage.active = isAdminChildActive && (this.adminPage.title === 'ADMIN_WORKSPACE');
      }
    })
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
  @HostListener('window:popstate', ['$event'])
  onPopState(event: any) {
    this.utilService.alertClose()
  }
}
