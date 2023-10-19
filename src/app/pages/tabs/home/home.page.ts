import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { JsonFormData } from 'src/app/shared/components/dynamic-form/dynamic-form.component';
import { CommonRoutes } from 'src/global.routes';
import { ModalController, NavController, Platform, IonContent } from '@ionic/angular';
import { SKELETON } from 'src/app/core/constants/skeleton.constant';
import { Router } from '@angular/router';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { HttpService, LoaderService, LocalStorageService, ToastService, UserService, UtilService } from 'src/app/core/services';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { SessionService } from 'src/app/core/services/session/session.service';
import { TermsAndConditionsPage } from '../../terms-and-conditions/terms-and-conditions.page';
import { App, AppState } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';


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
  showBecomeMentorCard
  @ViewChild(IonContent) content: IonContent;

  public headerConfig: any = {
    menu: true,
    notification: true,
    headerColor: 'primary',
    // label:'MENU'
  };
  isAMentor
  public segmentButtons = [{ name: "all-sessions", label: "ALL_SESSIONS" }, { name: "created-sessions", label: "CREATED_SESSIONS" }, { name: "my-sessions", label: "ENROLLED_SESSIONS" }]
  public mentorSegmentButton = ["created-sessions"]
  selectedSegment = "all-sessions";
  createdSessions: any;
  isMentor: boolean;
  constructor(
    private http: HttpClient,
    private router: Router,
    private navController: NavController,
    private profileService: ProfileService,
    private loaderService: LoaderService,
    private httpService: HttpService,
    private sessionService: SessionService,
    private modalController: ModalController,
    private userService: UserService,
    private localStorage: LocalStorageService,
    private toast:ToastService) { }

  ngOnInit() {
    this.isMentor = this.profileService.isMentor
    App.addListener('appStateChange', (state: AppState) => {
      this.localStorage.getLocalData(localKeys.USER_DETAILS).then(data => {
        if (state.isActive == true && data) {
          this.getSessions();
          if(this.isMentor){
            var obj = { page: this.page, limit: this.limit, searchText: "" };
            this.sessionService.getAllSessionsAPI(obj).then((data)=>{
            this.createdSessions = data;
          })
          }
        }
      })
    });
    this.getUser();
    this.localStorage.getLocalData(localKeys.ISROLEREQUESTED).then((isRoleRequested)=>{
      this.showBecomeMentorCard = isRoleRequested || this.profileService.isMentor ? false: true;
    })
    this.userService.userEventEmitted$.subscribe(data => {
      if (data) {
        this.isMentor = this.profileService.isMentor
        this.user = data;
      }
    })
    this.user = this.localStorage.getLocalData(localKeys.USER_DETAILS)
  }
  gotToTop() {
    this.content.scrollToTop(1000);
  }

  async ionViewWillEnter() {
    this.getSessions();
    this.gotToTop();
    var obj = { page: this.page, limit: this.limit, searchText: "" };
    this.isMentor = this.profileService.isMentor;
    this.createdSessions = this.isAMentor ? await this.sessionService.getAllSessionsAPI(obj) : []
  }
  async eventAction(event) {
    // if(this.user.about){
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
        if(enrollResult.result){
          this.toast.showToast(enrollResult.message, "success")
          this.getSessions();
        }
        break;

      case 'startAction':
        this.sessionService.startSession(event.data.id).then(async ()=>{
          var obj = { page: this.page, limit: this.limit, searchText: "" };
          this.createdSessions = await this.sessionService.getAllSessionsAPI(obj);
        })
        break;
    }
  // }else {
  //   this.router.navigate([`/${CommonRoutes.EDIT_PROFILE}`]);
  // }
  }
  viewMore(data) {
    this.router.navigate([`/${CommonRoutes.SESSIONS}`], { queryParams: { type: data } });
  }

  search() {
    this.router.navigate([`/${CommonRoutes.HOME_SEARCH}`]);
  }
  getUser() {
    this.profileService.profileDetails().then(data => {
      this.isAMentor = this.profileService.isMentor
      this.user = data
      if (!this.user?.terms_and_conditions) {
        // this.openModal();
      }
    })
  }

  async getSessions() {
    const config = {
      url: urlConstants.API_URLS.HOME_SESSION + this.page + '&limit=' + this.limit,
    };
    try {
      let data: any = await this.httpService.get(config);
      this.sessions = data.result;
      this.sessionsCount = data.result.count;
    }
    catch (error) {
    }
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
    let userDetails = await this.localStorage.getLocalData(localKeys.USER_DETAILS);
    this.router.navigate([`${CommonRoutes.CREATE_SESSION}`]);
    return
    if (userDetails?.about) {
      this.router.navigate([`${CommonRoutes.CREATE_SESSION}`]);
    } else {
      this.router.navigate([`/${CommonRoutes.TABS}/${CommonRoutes.PROFILE}`]);
    }
  }

  becomeMentor() {
    this.showBecomeMentorCard = false;
    this.router.navigate([`/${CommonRoutes.MENTOR_QUESTIONNAIRE}`]);
  }

  closeCard() {
    this.showBecomeMentorCard = false;
  }
}
