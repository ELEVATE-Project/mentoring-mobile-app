import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { HttpService, LocalStorageService, ToastService, UserService } from 'src/app/core/services';
import { SessionService } from 'src/app/core/services/session/session.service';
import { CommonRoutes } from 'src/global.routes';

@Component({
  selector: 'app-mentor-details',
  templateUrl: './mentor-details.page.html',
  styleUrls: ['./mentor-details.page.scss'],
})
export class MentorDetailsPage implements OnInit {
  mentorId;
  public headerConfig: any = {
    backButton: true,
    headerColor: "primary"
  };

  public buttonConfig = {
    label: "SHARE_PROFILE",
    action: "share"

  }

  detailData = {
    form: [
      {
        title: 'ABOUT',
        key: 'about',
      },
      {
        title: "DESIGNATION",
        key: "designation"
      },
      {
        title: 'YEAR_OF_EXPERIENCE',
        key: 'experience',
      },
      {
        title: 'KEY_AREAS_OF_EXPERTISE',
        key: 'areasOfExpertise',
      },
      {
        title: "EDUCATION_QUALIFICATION",
        key: "educationQualification"
      }
    ],
    data: {
      rating: {
        average:0
      },
      sessionsHosted:0 
    },
  };
  segmentValue = "about";
  upcomingSessions;
  constructor(
    private routerParams: ActivatedRoute,
    private httpService: HttpService,
    private router: Router,
    private sessionService: SessionService,
    private userService: UserService,
    private localStorage:LocalStorageService,
    private toastService:ToastService
  ) {
    routerParams.params.subscribe(params => {
      this.mentorId = params.id;
      this.userService.getUserValue().then(async (result) => {
        if (result) {
          this.getMentor();
        } else {
          this.router.navigate([`/${CommonRoutes.AUTH}/${CommonRoutes.LOGIN}`], { queryParams: { mentorId: this.mentorId } })
        }
      })
    })
  }

  ngOnInit() {
  }
  async ionViewWillEnter(){
    this.upcomingSessions = await this.sessionService.getUpcomingSessions(this.mentorId);
  }
  async getMentor() {
    let user = await this.localStorage.getLocalData(localKeys.USER_DETAILS);
    // this.mentorId=user._id;
    const config = {
      url: urlConstants.API_URLS.MENTOR_PROFILE_DETAILS + this.mentorId,
      payload: {}
    };
    try {
      let data: any = await this.httpService.get(config);
      this.detailData.data = data.result;
    }
    catch (error) {
    }
  }

  goToHome() {
    this.router.navigate([`/${CommonRoutes.TABS}/${CommonRoutes.HOME}`]);
  }

  async segmentChanged(ev: any) {
    this.segmentValue = ev.detail.value;
    this.upcomingSessions = (this.segmentValue == "upcoming") ? await this.sessionService.getUpcomingSessions(this.mentorId) : [];
  }
  async onAction(event){
    switch (event.type) {
      case 'cardSelect':
        this.router.navigate([`/${CommonRoutes.SESSIONS_DETAILS}/${event.data._id}`]);
        break;

      case 'joinAction':
        await this.sessionService.joinSession(event.data._id);
        this.upcomingSessions = await this.sessionService.getUpcomingSessions(this.mentorId);
        break;

      case 'enrollAction':
        await this.sessionService.enrollSession(event.data._id);
        this.upcomingSessions = await this.sessionService.getUpcomingSessions(this.mentorId);
        break;
    }
  }
}
