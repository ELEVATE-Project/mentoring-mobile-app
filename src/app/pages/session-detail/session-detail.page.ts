import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageService, ToastService, UserService, UtilService } from 'src/app/core/services';
import { SessionService } from 'src/app/core/services/session/session.service';
import { CommonRoutes } from 'src/global.routes';
import *  as moment from 'moment';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { Location } from '@angular/common';

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

  constructor(private localStorage: LocalStorageService, private router: Router,
    private activatedRoute: ActivatedRoute, private sessionService: SessionService,
    private utilService: UtilService, private toast: ToastService, private _location: Location, private user: UserService) {
    this.id = this.activatedRoute.snapshot.paramMap.get('id')
  }
  ngOnInit() {}

  async ionViewWillEnter() {
    await this.user.getUserValue();
    this.userDetails = await this.localStorage.getLocalData(localKeys.USER_DETAILS);
    this.fetchSessionDetails();
  }

  public headerConfig: any = {
    backButton: true,
    label: "SESSIONS_DETAILS",
    share: true
  };
  sessionHeaderData: any = {
    name: "",
    region: null,
    join_button: true,
    image: '',
    mentorName:''
  }
  detailData = {
    form: [
      {
        title: 'Session Details',
        key: 'description',
      },
      {
        title: 'Recommended For',
        key: 'recommendedFor',
      },
      {
        title: "Mentor Name",
        key:'mentorName'
      },
      {
        title: 'Medium',
        key: 'medium',
      },
      {
        title: 'Starting Time',
        key: 'startDate',
      },
      {
        title: "Duration",
        key: "duration"
      },
      {
        title: "Categories",
        key: "categories"
      },
    ],
    data: {
      description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
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
      duration: { hours: null, minutes: null },
      startDate: null,
      mentorName: null,
      status:null,
      isEnrolled:null,
    },
  };

  async fetchSessionDetails() {
    var response = await this.sessionService.getSessionDetailsAPI(this.id);
    if (response) {
      this.headerConfig.share = response.status=="completed"?false:true;
      this.id = response._id;
      if(this.userDetails){
        this.isCreator = this.userDetails._id == response.userId ? true : false;
      }
      let startDate = moment.unix(response.startDate);
      let endDate = moment.unix(response.endDate);
      let readableStartDate = startDate.toLocaleString();
      let hours = endDate.diff(startDate, 'hours');
      startDate=startDate.add(hours, 'hours');
      let minutes = endDate.diff(startDate, 'minutes');
      response.duration = { hours: hours, minutes: minutes };
      let currentTimeInSeconds=Math.floor(Date.now()/1000);
      this.isEnabled = (response.startDate-currentTimeInSeconds<300)?true:false;
      this.sessionHeaderData.name = response.title;
      this.sessionHeaderData.image = response.image;
      this.sessionHeaderData.mentorName = response.mentorName;
      this.detailData.data = Object.assign({}, response);
      this.detailData.data.startDate = readableStartDate;
    }
  }

  action(event) {
    switch (event) {
      case 'share':
        this.share();
        break;
    }
  }

  async share() {
    if(this.userDetails){
      let sharableLink = await this.sessionService.getShareSessionId(this.id);
      if (sharableLink.shareLink) {
        let url = `/${CommonRoutes.SESSIONS}/${CommonRoutes.SESSIONS_DETAILS}/${sharableLink.shareLink}`;
        let link = await this.utilService.getDeepLink(url);
        this.detailData.data.mentorName = this.detailData.data.mentorName.trim();
        this.sessionHeaderData.name = this.sessionHeaderData.name.trim();
        let params = { link: link, subject: this.sessionHeaderData?.title, text: "Join an expert session on " + `${this.sessionHeaderData.name} ` + "hosted by " + `${this.detailData.data.mentorName}` + " using the link" }
        this.utilService.shareLink(params);
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

  onDelete() {
    let msg = {
      header: 'DELETE_SESSION',
      message: 'DELETE_CONFIRM_MSG',
      cancel: "Don't delete",
      submit: 'Yes Delete'
    }
    this.utilService.alertPopup(msg).then(async data => {
      if (data) {
        let result = await this.sessionService.deleteSession(this.id);
        if (result.responseCode == "OK") {
          this.toast.showToast(result.message, "success");
          this._location.back();
        }
      }
    }).catch(error => { })
  }

  async onJoin() {
    await this.sessionService.joinSession(this.id);
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
      cancel: 'CLOSE',
      submit: 'CANCEL'
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
}
