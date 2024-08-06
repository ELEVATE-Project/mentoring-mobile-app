import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { JsonFormData } from 'src/app/shared/components/dynamic-form/dynamic-form.component';
import { CommonRoutes } from 'src/global.routes';
import { ModalController, NavController, IonContent } from '@ionic/angular';
import { SKELETON } from 'src/app/core/constants/skeleton.constant';
import { Router } from '@angular/router';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { HttpService, LoaderService, LocalStorageService, ToastService, UserService, UtilService } from 'src/app/core/services';
import { SessionService } from 'src/app/core/services/session/session.service';
import { TermsAndConditionsPage } from '../../terms-and-conditions/terms-and-conditions.page';
import { App, AppState } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { PermissionService } from 'src/app/core/services/permission/permission.service';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  public formData: JsonFormData;
  user;
  SESSIONS: string = CommonRoutes.SESSIONS;
  SKELETON = SKELETON;
  page = 1;
  limit = 100;
  sessions;
  sessionsCount = 0;
  isNativeApp = Capacitor.isNativePlatform()
  status = "PUBLISHED,LIVE";
  showBecomeMentorCard = false;
  @ViewChild(IonContent) content: IonContent;

  public headerConfig: any = {
    menu: true,
    notification: true,
    headerColor: 'primary',
    // label:'MENU'
  };
  public segmentButtons = [{ name: "all-sessions", label: "ALL_SESSIONS" }, { name: "created-sessions", label: "MY_MENTORING_SESSIONS" }, { name: "my-sessions", label: "ENROLLED_SESSIONS" }]
  public mentorSegmentButton = ["created-sessions"]
  selectedSegment = "all-sessions";
  createdSessions: any;
  isMentor: boolean;
  userEventSubscription: any;
  isOpen = false;

  chips= [];
  criteriaChip: any;
  searchText: string;
  constructor(
    private router: Router,
    private profileService: ProfileService,
    private sessionService: SessionService,
    private modalController: ModalController,
    private userService: UserService,
    private localStorage: LocalStorageService,
    private toast: ToastService,
    private permissionService: PermissionService,
    private utilService: UtilService) { }

  async ngOnInit() {
    await this.getUser();
    this.isMentor = this.profileService.isMentor
    App.addListener('appStateChange', (state: AppState) => {
      this.localStorage.getLocalData(localKeys.USER_DETAILS).then(data => {
        if (state.isActive == true && data && !data.profile_mandatory_fields.length) {
          this.getSessions();
          if(this.profileService.isMentor){
            this.getCreatedSessionDetails();
          }
        }
      })
    });
    let isRoleRequested = this.localStorage.getLocalData(localKeys.IS_ROLE_REQUESTED)
    let isBecomeMentorTileClosed = this.localStorage.getLocalData(localKeys.IS_BECOME_MENTOR_TILE_CLOSED)
    this.showBecomeMentorCard = isRoleRequested || this.profileService.isMentor || isBecomeMentorTileClosed ? false : true;
    if(this.profileService.isMentor){
      this.getCreatedSessionDetails();
    }
    this.userEventSubscription = this.userService.userEventEmitted$.subscribe(data => {
      if (data) {
        this.isMentor = this.profileService.isMentor
        this.user = data;
      }
    })
    this.user = this.localStorage.getLocalData(localKeys.USER_DETAILS)
    this.permissionService.getPlatformConfig().then((config)=>{
      this.chips = config.result.search_config.search.session.fields;
    })
  }
  gotToTop() {
    this.content.scrollToTop(1000);
  }

  async ionViewWillEnter() {
    this.user = await this.localStorage.getLocalData(localKeys.USER_DETAILS);
    if(this.user && !this.user.profile_mandatory_fields.length){
      this.getSessions();
    }
    this.gotToTop();
    let isRoleRequested = await this.localStorage.getLocalData(localKeys.IS_ROLE_REQUESTED)
    let isBecomeMentorTileClosed =await this.localStorage.getLocalData(localKeys.IS_BECOME_MENTOR_TILE_CLOSED)
    this.showBecomeMentorCard = isRoleRequested || this.profileService.isMentor || isBecomeMentorTileClosed ? false : true;
    var obj = { page: this.page, limit: this.limit, searchText: "" };
    this.isMentor = this.profileService.isMentor;
    this.createdSessions = this.isMentor ? await this.sessionService.getAllSessionsAPI(obj) : []
  }
  async eventAction(event) {
    if (this.user.about || window['env']['isAuthBypassed']) {
      switch (event.type) {
        case 'cardSelect':
          this.router.navigate([`/${CommonRoutes.SESSIONS_DETAILS}/${event.data.id}`]);
          break;

        case 'joinAction':
          await this.sessionService.joinSession(event.data)
          this.getSessions();
          break;

        case 'enrollAction':
          let enrollResult = await this.sessionService.enrollSession(event.data.id);
          if (enrollResult.result) {
            this.toast.showToast(enrollResult.message, "success")
            this.getSessions();
          }
          break;

        case 'startAction':
          this.sessionService.startSession(event.data.id).then(async () => {
            var obj = { page: this.page, limit: this.limit, searchText: "" };
            if(this.profileService.isMentor){
              this.createdSessions = await this.sessionService.getAllSessionsAPI(obj);
            }
          })
          break;
      }
    } else {
      this.profileService.upDateProfilePopup()
    }
  }
  viewMore(data) {
    this.router.navigate([`/${CommonRoutes.SESSIONS}`], { queryParams: { type: data } });
  }

  search(event: string) {
    this.isOpen = false;
    if(event && event.length >= 3){
      this.searchText = event ? event : "";
      this.utilService.subscribeSearchText(this.searchText);
      this.utilService.subscribeCriteriaChip(JSON.stringify(this.criteriaChip))
      this.router.navigate([`/${CommonRoutes.HOME_SEARCH}`]);
    }else {
      this.toast.showToast("ENTER_MIN_CHARACTER","danger");
    }
  }
  async getUser() {
    let data = await this.profileService.getProfileDetailsFromAPI()
    this.isMentor = this.profileService.isMentor
    this.user = data
    if (!this.user?.terms_and_conditions) {
      // this.openModal();
    }
  }

  async getSessions() {
    var obj = {page: this.page, limit: this.limit}
    let data = await this.sessionService.getSessions(obj);
    this.sessions = data.result;
    this.sessionsCount = data.result.count;
  }
  async openModal() {
    const modal = await this.modalController.create({
      component: TermsAndConditionsPage,
      backdropDismiss: false,
      swipeToClose: false
    });
    return await modal.present();
  }
  async segmentChanged(event) {
    this.selectedSegment = event.name;
  }
  async createSession() {
    if (this.user?.about != null || window['env']['isAuthBypassed']) {
      this.router.navigate([`${CommonRoutes.CREATE_SESSION}`]); 
    } else {
      this.profileService.upDateProfilePopup()
    }
  }

  async becomeMentor() {
    if(this.user?.about != null || window['env']['isAuthBypassed']){
      this.router.navigate([`/${CommonRoutes.MENTOR_QUESTIONNAIRE}`]);   
    } else{
      this.profileService.upDateProfilePopup()
    }
  }

  async closeCard() {
    this.showBecomeMentorCard = false;
    await this.localStorage.setLocalData(localKeys.IS_BECOME_MENTOR_TILE_CLOSED, true)
  }

  getCreatedSessionDetails() {
    if (this.isMentor) {
      var obj = { page: this.page, limit: this.limit, searchText: "" };
      this.sessionService.getAllSessionsAPI(obj).then((data) => {
        this.createdSessions = data;
      })
    }
  }

  ngOnDestroy(): void {
    if (this.userEventSubscription) {
      this.userEventSubscription.unsubscribe();
    }
  }

  selectChip(chip: any) {
    if (this.criteriaChip === chip) {
      this.criteriaChip = null;
    } else {
      this.criteriaChip = chip;
    }
  }

  ionViewDidLeave(){
    this.criteriaChip = '';
    this.searchText = '';
  }

}
