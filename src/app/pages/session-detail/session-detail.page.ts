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
import { Clipboard } from '@capacitor/clipboard';


@Component({
  selector: 'app-session-detail',
  templateUrl: './session-detail.page.html',
  styleUrls: ['./session-detail.page.scss'],
})
export class SessionDetailPage implements OnInit {
  id: any;
  showEditButton: any;
  isCreator:any = false;
  userDetails: any;
  isEnabled: boolean;
  startDate: any;
  endDate: any;
  sessionDatas: any;
  snackbarRef: any;
  skipWhenDelete: boolean= false;
  dismissWhenBack: boolean = false;
  platformOff: any;
  isLoaded : boolean = false
  public isMobile:any
  userCantAccess:any = true;

  constructor(private localStorage: LocalStorageService, private router: Router,
    private activatedRoute: ActivatedRoute, private sessionService: SessionService,
    private utilService: UtilService, private toast: ToastService, private user: UserService ,private toaster: ToastController,private translate : TranslateService,
    private _location: Location,) {
    this.id = this.activatedRoute.snapshot.paramMap.get('id')
    this.isMobile = utilService.isMobile()
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
        key: "meeting_info",
      },
      {
        title: 'RECOMMENDED_FOR',
        key: 'recommended_for',
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
      id:'',
      image: [],
      description: '',
      recommended_for: [
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
      mentor_name: null,
      status:null,
      is_enrolled:null,
      title:"",
      start_date:"",
      meeting_info:""
    },
  };

  async fetchSessionDetails() { 
    var response = await this.sessionService.getSessionDetailsAPI(this.id);
    this.sessionDatas = response?.result;
    this.isLoaded = true ;
    this.userCantAccess = response?.responseCode == 'OK' ? false:true
    if (!this.userCantAccess) {
      response = response.result;
      this.setPageHeader(response);
      let readableStartDate = moment.unix(response.start_date).toLocaleString();
      let currentTimeInSeconds=Math.floor(Date.now()/1000);
      if(response.is_enrolled){
        this.isEnabled = ((response.start_date - currentTimeInSeconds) < 600 || response.status=='LIVE') ? true : false
      } else {
        this.isEnabled = ((response.start_date-currentTimeInSeconds)<600 || response.status=='LIVE')?true:false;
      }
      this.detailData.data = Object.assign({}, response);
      this.detailData.data.start_date = readableStartDate;
      this.detailData.data.meeting_info = response.meeting_info?.platform;
      this.startDate = (response.start_date>0)?moment.unix(response.start_date).toLocaleString():this.startDate;
      this.endDate = (response.end_date>0)?moment.unix(response.end_date).toLocaleString():this.endDate;
      this.platformOff = (response?.meeting_info?.platform == 'OFF') ? true : false;
    }
    if((response?.meeting_info?.platform == 'OFF') && this.isCreator && response.status=='PUBLISHED'){
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
    if(!this.skipWhenDelete && this.snackbarRef){
      this.snackbarRef = this.toaster.dismiss()
    }
   }

  setPageHeader(response) {
    let currentTimeInSeconds=Math.floor(Date.now()/1000);
    this.isEnabled = ((response.start_date-currentTimeInSeconds)<600 || response.status=='LIVE')?true:false;
      this.headerConfig.share = response.status=="COMPLETED"?false:true;
      this.id = response.id;
      if(this.userDetails){
        this.isCreator = this.userDetails.id == response.mentor_id ? true : false;
      }
      this.headerConfig.edit = (this.isCreator && response.status=="PUBLISHED"&& !this.isEnabled)?true:null;
      this.headerConfig.delete = (this.isCreator && response.status=="PUBLISHED" && !this.isEnabled)?true:null;
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
    if(this.isMobile && navigator.share){
      if(this.id){
          let url = `/${CommonRoutes.SESSIONS_DETAILS}/${this.id}`;
          let link = await this.utilService.getDeepLink(url);
          this.detailData.data.mentor_name = this.detailData.data.mentor_name.trim();
          this.detailData.data.title = this.detailData.data.title.trim();
          let params = { link: link, subject: this.detailData.data.title, text: "Join an expert session on " + `${this.detailData.data.title} ` + "hosted by " + `${this.detailData.data.mentor_name}` + " using the link" }
          await this.utilService.shareLink(params);
      } else {
        this.router.navigate([`${CommonRoutes.AUTH}/${CommonRoutes.LOGIN}`], { queryParams:{sessionId: this.id, isMentor:false}});
      } 
    } else {
      await this.copyToClipBoard(window.location.href)
      this.toast.showToast("LINK_COPIED","success")
    }
  }

  copyToClipBoard = async (copyData: any) => {
    await Clipboard.write({
      string: copyData
    }).then(()=>{
      this.toast.showToast('Copied successfully',"success");
    });
  };

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
    if (this.userDetails) {
      if (this.userDetails?.about) {
        let result = await this.sessionService.enrollSession(this.id);
        if (result?.result) {
          this.toast.showToast(result?.message, "success");
        }
        this.fetchSessionDetails();
      } else {
        this.router.navigate([`/${CommonRoutes.TABS}/${CommonRoutes.PROFILE}`]);
      }
    }else {
      this.router.navigate([`/${CommonRoutes.AUTH}/${CommonRoutes.LOGIN}`], { queryParams:{sessionId: this.id}});
    }
  }

  async onStart(data) {
    let result = await this.sessionService.startSession(data);
    result?this.router.navigate([`/${CommonRoutes.TABS}/${CommonRoutes.HOME}`]):null;
  }

  async onCancel() {
    let msg = {
      header: 'CANCEL_SESSION',
      message: 'CANCEL_CONFIRM_MESSAGE',
      cancel: 'CANCEL',
      submit: 'UN_ENROLL'
    }

    this._location.subscribe(() => {
      this.utilService.alertClose();
    });

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
  
  goToHome() {
    this.router.navigate([`/${CommonRoutes.TABS}/${CommonRoutes.HOME}`]);
  }
}
