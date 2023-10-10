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
import { Location } from '@angular/common';
import { TermsAndConditionsPage } from '../../terms-and-conditions/terms-and-conditions.page';
import { App, AppState } from '@capacitor/app';


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
  status = "published,live";
  @ViewChild(IonContent) content: IonContent;

  public headerConfig: any = {
    menu: true,
    notification: true,
    headerColor: 'primary',
    // label:'MENU'
  };
  public responses = {
    "response_code": "OK",
    "message": "Session fetched successfully.",
    "result": {
      "all_sessions": [
        {
          "id": 1,
          "title": "session",
          "description": "descriptio",
          "image": [
            "https://mentoring-dev-storage.s3.ap-south-1.amazonaws.com/session/62a73ffb12c0c4fe9b4c0f61-1695201766113-images_jpeg"
          ],
          "user_id": 2,
          "status": "published",
          "start_date": 1697215860,
          "end_date": 1697219460,
          "meeting_info": {
            "platform": "BigBlueButton (Default)",
            "value": "Default"
          },
          "created_at": "2023-09-13T16:51:46.377Z",
          "is_enrolled": false,
          "mentor_name": "afnan"
        }
      ],
      "my_sessions": []
    },
    "meta": {
      "type": "feedback",
      "data": [
        {
          "id": 3,
          "title": "STEM Education in India: Fostering Innovation and Scientific Thinking",
          "description": "Explore the significance of STEM (Science, Technology, Engineering, and Mathematics) education in India. Discuss ways to nurture scientific curiosity and innovation among Indian students.",
          "mentor_feedback_form": "mentorQS2",
          "form": [
            {
              "id": 4,
              "options": [],
              "type": "rating",
              "deleted": false,
              "disable": false,
              "visible": true,
              "status": "published",
              "name": "mentorEngagementInSession",
              "value": "",
              "class": "ion-margin",
              "no_of_stars": 5,
              "updated_at": "2021-12-14T09:41:55.552Z",
              "created_at": "2021-12-14T09:41:55.552Z",
              "questions_set_id": 5,
              "validators": {
                "required": false
              },
              "label": "How would you rate the engagement in the session?"
            }
          ],
          "org_id": 22
        }
      ],
      "correlation": "87a59ed4-483d-4d02-a6ae-9aad8b218f45",
      "meeting_platform": "BBB"
    }
  }
  public segmentButtons = [{ name: "all-sessions", label: "ALL_SESSIONS" }, { name: "created-sessions", label: "CREATED_SESSIONS" }, { name: "my-sessions", label: "ENROLLED_SESSIONS" }]
  public mentorSegmentButton = ["created-sessions"]
  selectedSegment = "all-sessions";
  createdSessions: any;
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
    App.addListener('appStateChange', (state: AppState) => {
      this.localStorage.getLocalData(localKeys.USER_DETAILS).then(data => {
        if (state.isActive == true && data) {
          this.getSessions();
          var obj = { page: this.page, limit: this.limit, searchText: "" };
           this.sessionService.getAllSessionsAPI(obj).then((data)=>{
              this.createdSessions = data;
              console.log()
          })
        }
      })
    });
    this.getUser();
    this.userService.userEventEmitted$.subscribe(data => {
      if (data) {
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
    this.createdSessions = await this.sessionService.getAllSessionsAPI(obj);
  }
  async eventAction(event) {
    if(this.user.about){
    switch (event.type) {
      case 'cardSelect':
        (this.selectedSegment=="my-sessions")?this.router.navigate([`/${CommonRoutes.SESSIONS_DETAILS}/${event.data.sessionId}`]):this.router.navigate([`/${CommonRoutes.SESSIONS_DETAILS}/${event.data._id}`]);
        break;

      case 'joinAction':
        await this.sessionService.joinSession(event.data)
        this.getSessions();
        break;

      case 'enrollAction':
        let enrollResult = await this.sessionService.enrollSession(event.data._id);
        if(enrollResult.result){
          this.toast.showToast(enrollResult.message, "success")
          this.getSessions();
        }
        break;

      case 'startAction':
        this.sessionService.startSession(event.data._id).then(async ()=>{
          var obj = { page: this.page, limit: this.limit, searchText: "" };
          this.createdSessions = await this.sessionService.getAllSessionsAPI(obj);
        })
        break;
    }
  }else {
    this.router.navigate([`/${CommonRoutes.EDIT_PROFILE}`]);
  }
  }
  viewMore(data) {
    this.router.navigate([`/${CommonRoutes.SESSIONS}`], { queryParams: { type: data } });
  }

  search() {
    this.router.navigate([`/${CommonRoutes.HOME_SEARCH}`]);
  }
  getUser() {
    this.profileService.profileDetails().then(data => {
      this.user = data
      // if (!this.user?.hasAcceptedTAndC) {
      //   this.openModal();
      // }
    })
  }

  async getSessions() {
    const config = {
      url: urlConstants.API_URLS.HOME_SESSION + this.page + '&limit=' + this.limit,
    };
    try {
      // let data: any = await this.httpService.get(config);
      let data: any = this.responses;
      this.sessions = data.result;
      this.sessionsCount = data.result.count;
      console.log(this.sessions )
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
    if (userDetails?.about) {
      this.router.navigate([`${CommonRoutes.CREATE_SESSION}`]);
    } else {
      this.router.navigate([`/${CommonRoutes.TABS}/${CommonRoutes.PROFILE}`]);
    }
  }
}
