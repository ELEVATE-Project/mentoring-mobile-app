import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { config } from 'rxjs';
import { ToastService, UtilService } from 'src/app/core/services';
import { SessionService } from 'src/app/core/services/session/session.service';
import { CommonRoutes } from 'src/global.routes';

@Component({
  selector: 'app-session-detail',
  templateUrl: './session-detail.page.html',
  styleUrls: ['./session-detail.page.scss'],
})
export class SessionDetailPage implements OnInit {
  id: any;
  status: any;
  showEditButton: any;

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private sessionService: SessionService, private utilService:UtilService, private toast: ToastService) {
    this.activatedRoute.queryParamMap.subscribe(params => {
      this.id = params?.get('id');
      this.status = params?.get('status');
    });
  }
  ngOnInit() {
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
        title: 'Audience',
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
        title: "Date",
        key: "startDateTime"
      }
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
      duration: "",
      startDateTime: "",
    },
  };

  async fetchSessionDetails() {
    var response = await this.sessionService.getSessionDetailsAPI(this.id);
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

  share() {
    // ToDO implement share feature
  }

  editSession() {
    this.router.navigate([CommonRoutes.CREATE_SESSION], {queryParams: {id: this.id}});
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
        this.toast.showToast("Will be implemented soon!!","success")
      }
    }).catch(error => { })
  }
}
