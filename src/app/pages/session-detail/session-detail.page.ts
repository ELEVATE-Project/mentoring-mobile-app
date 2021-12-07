import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { config } from 'rxjs';
import { LocalStorageService, ToastService, UtilService } from 'src/app/core/services';
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
  isCreator: boolean;

  constructor(private localStorage: LocalStorageService, private router: Router,
    private activatedRoute: ActivatedRoute, private sessionService: SessionService,
    private utilService: UtilService, private toast: ToastService, private _location: Location) {
    this.id = this.activatedRoute.snapshot.paramMap.get('id')
  }
  ngOnInit() {}

  ionViewWillEnter() {
    this.fetchSessionDetails();
  }

  public headerConfig: any = {
    headerColor: 'white',
    backButton: true,
    label: "SESSIONS_DETAILS",
    share: true
  };
  sessionHeaderData: any = {
    name: "",
    region: null,
    join_button: true,
    image: null,
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
        title: 'Medium',
        key: 'medium',
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
    },
  };

  async fetchSessionDetails() {
    let userDetails = await this.localStorage.getLocalData(localKeys.USER_DETAILS);
    var response = await this.sessionService.getSessionDetailsAPI(this.id);
    if (response) {
      this.isCreator = userDetails._id == response.userId ? true : false;
      response.startDate = moment.unix(response.startDate);
      response.endDate = moment.unix(response.endDate);
      var hours = response.endDate.diff(response.startDate, "hours");
      response.startDate.add(hours, "hours");
      var minutes = response.endDate.diff(response.startDate, "minutes");
      response.duration = { hours: hours, minutes: minutes };
      this.sessionHeaderData.name = response.title;
      this.sessionHeaderData.image = response.image;
      this.detailData.data = response;
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
    let sharableLink = await this.sessionService.getShareSessionId(this.id);
    if (sharableLink.shareLink) {
      let url = `/${CommonRoutes.SESSIONS}/${CommonRoutes.SESSIONS_DETAILS}/${sharableLink.shareLink}`;
      let link = await this.utilService.getDeepLink(url);
      let params = { link: link, subject: this.sessionHeaderData?.title, text: "Join this session using the link provided here " }
      this.utilService.shareLink(params);
    } else {
      this.toast.showToast("No link generated!!!", "danger");
    }
  }

  editSession() {
    this.router.navigate([CommonRoutes.CREATE_SESSION], { queryParams: { id: this.id } });
  }

  onDelete() {
    let msg = {
      header: 'DELETE',
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
    let result = await this.sessionService.joinSession(this.id);
  }

  async onEnroll() {
    let result = await this.sessionService.enrollSession(this.id);
    if (result?.result) {
      this.toast.showToast("You have enrolled successfully", "success");
    }
    this.fetchSessionDetails();
  }

  async onStart(data) {
    let result = await this.sessionService.startSession(data._id);
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
          this.toast.showToast("You have unenrolled successfully", "success");
        }
        this.fetchSessionDetails();
      }
    }).catch(error => { })
  }
}
