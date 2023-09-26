import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageService, ToastService, UserService, UtilService } from 'src/app/core/services';
import { SessionService } from 'src/app/core/services/session/session.service';
import { CommonRoutes } from 'src/global.routes';
import *  as moment from 'moment';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { Location } from '@angular/common';
import { ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { App, AppState } from '@capacitor/app';

@Component({
  selector: 'app-session-detail',
  templateUrl: './session-detail.page.html',
  styleUrls: ['./session-detail.page.scss'],
})
export class SessionDetailPage implements OnInit {
  id: any;
  showEditButton: any;
  isCreator: boolean=false;
  userDetails: any;
  isEnabled: boolean;
  startDate: any;
  endDate: any;
  sessionDatas: any;
  snackbarRef: any;
  skipWhenDelete: boolean= false;
  dismissWhenBack: boolean = false;
  platformOff: any;

  constructor(private localStorage: LocalStorageService, private router: Router,
    private activatedRoute: ActivatedRoute, private sessionService: SessionService,
    private utilService: UtilService, private toast: ToastService, private _location: Location, private user: UserService ,private toaster: ToastController,private translate : TranslateService) {
    this.id = this.activatedRoute.snapshot.paramMap.get('id')
  }
  ngOnInit() {
      App.addListener('appStateChange', (state: AppState) => {
        if (state.isActive == true && this.id && this.sessionDatas && !this.dismissWhenBack) {
          this.fetchSessionDetails();
        }
      });
  }

  async ionViewWillEnter() {
    await this.user.getUserValue();
    this.userDetails = await this.localStorage.getLocalData(localKeys.USER_DETAILS);
    this.fetchSessionDetails();
  }

  public headerConfig: any = {
    backButton: true,
    label: "",
    share: false
  };
  detailData = {
    form: [
      {
        title: "MEETING_PLATFORM",
        key: "meetingInfo",
      },
      {
        title: 'RECOMMENDED_FOR',
        key: 'recommendedFor',
      },
      {
        title: "CATEGORIES",
        key: "categories"
      },
      {
        title: 'MEDIUM',
        key: 'medium',
      }
    ],
    data: {
      image: [],
      description: '',
      recommendedFor: [
        {
          "value": "Teachers",
          "label": "Teachers"
        },
        {
          "value": "Block Officers",
          "label": "Block Officers"
        },
      ],
      medium: [
        {
          "value": "English",
          "label": "English"
        },
        {
          "value": "Hindi",
          "label": "Hindi"
        },
      ],
      categories: [
        {
          "value": "Educational Leadership",
          "label": "Educational Leadership"
        },
        {
          "value": "School Process",
          "label": "School Process"
        },
        {
          "value": "Communication",
          "label": "Communication"
        },
        {
          "value": "SQAA",
          "label": "SQAA"
        },
        {
          "value": "Professional Development",
          "label": "Professional Development"
        },
      ],
      mentorName: null,
      status:null,
      isEnrolled:null,
      title:"",
      startDate:"",
      meetingInfo:""
    },
  };

  async fetchSessionDetails() {
    var response = await this.sessionService.getSessionDetailsAPI(this.id);
    this.sessionDatas = response;
    console.log(response)
    if (response) {
      this.setPageHeader(response);
      let readableStartDate = moment.unix(response.startDate).toLocaleString();
      let currentTimeInSeconds=Math.floor(Date.now()/1000);
      if(response.isEnrolled){
        this.isEnabled = ((response.startDate - currentTimeInSeconds) < 600 || response.status=='live') ? true : false
      } else {
        this.isEnabled = ((response.startDate-currentTimeInSeconds)<600 || response.status=='live')?true:false;
      }
      this.detailData.data = Object.assign({}, response);
      this.detailData.data.startDate = readableStartDate;
      this.detailData.data.meetingInfo = response.meetingInfo.platform;
      this.startDate = (response.startDate>0)?moment.unix(response.startDate).toLocaleString():this.startDate;
      this.endDate = (response.endDate>0)?moment.unix(response.endDate).toLocaleString():this.endDate;
      this.platformOff = (response?.meetingInfo?.platform == 'OFF') ? true : false;
    }
    if((response?.meetingInfo?.platform == 'OFF') && this.isCreator && response.status=='published'){
      this.showToasts('ADD_MEETING_LINK', 0 , [
          {
            text: 'Add meeting link',
            role: 'cancel',
            handler: () => {
              this.router.navigate([CommonRoutes.CREATE_SESSION], { queryParams: { id: this.id , type: 'segment'} });
            }
          }
        ])
    } 
    this.dismissWhenBack = true;
  }
  ionViewWillLeave(){
    if(!this.skipWhenDelete){this.snackbarRef = this.toaster.dismiss()}
   }

  setPageHeader(response) {
    let currentTimeInSeconds=Math.floor(Date.now()/1000);
    this.isEnabled = ((response.startDate-currentTimeInSeconds)<600 || response.status=='live')?true:false;
      this.headerConfig.share = response.status=="completed"?false:true;
      this.id = response._id;
      if(this.userDetails){
        this.isCreator = this.userDetails._id == response.userId ? true : false;
      }
      this.headerConfig.edit = (this.isCreator && response.status=="published"&& !this.isEnabled)?true:null;
      this.headerConfig.delete = (this.isCreator && response.status=="published" && !this.isEnabled)?true:null;
  }

  action(event) {
    switch (event) {
      case 'share':
        this.share();
        break;
      case 'edit':
        this.editSession()
        break;
      case 'delete':
        this.deleteSession()
        break;
    }
  }

  async share() {
    if(this.userDetails){
      let sharableLink = await this.sessionService.getShareSessionId(this.id);
      if (sharableLink.shareLink) {
        let url = `/${CommonRoutes.SESSIONS_DETAILS}/${sharableLink.shareLink}`;
        let link = await this.utilService.getDeepLink(url);
        this.detailData.data.mentorName = this.detailData.data.mentorName.trim();
        this.detailData.data.title = this.detailData.data.title.trim();
        let params = { link: link, subject: this.detailData.data.title, text: "Join an expert session on " + `${this.detailData.data.title} ` + "hosted by " + `${this.detailData.data.mentorName}` + " using the link" }
        await this.utilService.shareLink(params);
      } else {
        this.toast.showToast("No link generated!!!", "danger");
      }
    } else {
      this.router.navigate([`${CommonRoutes.AUTH}/${CommonRoutes.LOGIN}`], { queryParams:{sessionId: this.id, isMentor:false}});
    }
  }

  editSession() {
    this.router.navigate([CommonRoutes.CREATE_SESSION], { queryParams: { id: this.id } });
  }

  deleteSession() {
    let msg = {
      header: 'DELETE_SESSION',
      message: 'DELETE_CONFIRM_MSG',
      cancel: "DON'T_DELETE",
      submit: 'YES_DELETE'
    }
    this.utilService.alertPopup(msg).then(async data => {
      if (data) {
        let result = await this.sessionService.deleteSession(this.id);
        if (result.responseCode == "OK") {
          this.skipWhenDelete= true;
          this.id = null;
          this.toast.showToast(result.message, "success");
          this.router.navigate([`/${CommonRoutes.TABS}/${CommonRoutes.HOME}`], { replaceUrl: true });
          this.snackbarRef = this.toaster.dismiss();
        }
      }
    }).catch(error => { })
  }

  async onJoin() {
    await this.sessionService.joinSession(this.sessionDatas);
  }

  async onEnroll() {
    if (this.userDetails && this.userDetails.hasAcceptedTAndC) {
      if (this.userDetails?.about) {
        let result = await this.sessionService.enrollSession(this.id);
        if (result?.result) {
          this.toast.showToast(result?.message, "success");
        }
        this.fetchSessionDetails();
      } else {
        this.router.navigate([`/${CommonRoutes.TABS}/${CommonRoutes.PROFILE}`]);
      }
    } else if(this.userDetails && !this.userDetails.hasAcceptedTAndC){
      this.router.navigate([`/${CommonRoutes.TERMS_AND_CONDITIONS}`], { queryParams:{sessionId: this.id}});
    } else {
      this.router.navigate([`/${CommonRoutes.AUTH}/${CommonRoutes.LOGIN}`], { queryParams:{sessionId: this.id}});
    }
  }

  async onStart(data) {
    let result = await this.sessionService.startSession(data._id);
    result?this.router.navigate([`/${CommonRoutes.TABS}/${CommonRoutes.HOME}`]):null;
  }

  async onCancel() {
    let msg = {
      header: 'CANCEL_SESSION',
      message: 'CANCEL_CONFIRM_MESSAGE',
      cancel: 'CANCEL',
      submit: 'UN_ENROLL'
    }
    this.utilService.alertPopup(msg).then(async data => {
      if (data) {
        let result = await this.sessionService.unEnrollSession(this.id);
        if (result?.result) {
          this.toast.showToast(result?.message, "success");
        }
        this.fetchSessionDetails();
      }
    }).catch(error => { })
  }
  showToasts(message: any,duration : any, toastButton : any){
    let texts;
        this.translate.get([message]).subscribe(resp =>{
          texts = resp;
        });
    this.snackbarRef = this.toaster.create({
            message: texts[message],
            // color: "danger",
            buttons: toastButton,
            cssClass: 'custom-toast'
        }).then((toastData) => {
      
      toastData.present();
    });
  }
}
