import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { config } from 'rxjs';
import { ToastService, UtilService } from 'src/app/core/services';
import { SessionService } from 'src/app/core/services/session/session.service';
import { CommonRoutes } from 'src/global.routes';
import *  as moment from 'moment';

@Component({
  selector: 'app-session-detail',
  templateUrl: './session-detail.page.html',
  styleUrls: ['./session-detail.page.scss'],
})
export class SessionDetailPage implements OnInit {
  id: any;
  status: any;
  showEditButton: any;

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private sessionService: SessionService, private utilService: UtilService, private toast: ToastService) {
    this.activatedRoute.queryParamMap.subscribe(params => {
      this.id = params?.get('id');
      this.status = params?.get('status');
      if(!this.id){
        this.id = this.activatedRoute.snapshot.paramMap.get('id')
      }
    });
  }
  ngOnInit() {
    this.headerConfig.share = (this.status == "published,live") ? true : false;
  }

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
    session_image: null,
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
      duration: {hours:null, minutes:null},
    },
  };

  async fetchSessionDetails() {
    var response = await this.sessionService.getSessionDetailsAPI(this.id);
    var now = moment(response.startDate);
    var end = moment(response.endDate);
    var sessionDuration = await moment.duration(end.diff(now));
    //response.duration= sessionDuration.hours()==0 ? sessionDuration.minutes()+" Minutes" : sessionDuration.hours()+" Hours "+sessionDuration.minutes()+" Minutes";
    response.duration = {hours:sessionDuration.hours(), minutes:sessionDuration.minutes()};
    this.sessionHeaderData.name = response.title;
    this.detailData.data = response;
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
    let url = "/sessions/details/"+sharableLink.shareLink;
    let link = await this.utilService.getDeepLink(url);
    console.log(link);
    let params = {link: link, subject: this.sessionHeaderData?.title, text: "Join this session using the link provided here "}
    this.utilService.shareLink(params);
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
    this.utilService.alertPopup(msg).then(data => {
      if (data) {
        this.toast.showToast("Will be implemented soon!!", "success")
      }
    }).catch(error => { })
  }
}
