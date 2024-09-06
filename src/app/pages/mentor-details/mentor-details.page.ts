import { DataSource } from '@angular/cdk/collections';
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
    meta : { 
      id: null
    },
    buttons: [
      {
        label: "SHARE_PROFILE",
        action: "share",
      }
    ]
  }

  detailData = {
    form: [
      {
        title: "DESIGNATION",
        key: "designation"
      },
      {
        title: "ORGANIZATION",
        key: "organizationName"
      },
      {
        title: "Competencies",
        key: "competency" 
      }
    ],
    data: {
      rating: {
        average:0
      },
      sessions_hosted:0 ,
      organizationName:""
    },
  };
  userCantAccess:any;
  isloaded:boolean=false
  segmentValue = "about";
  upcomingSessions;
  mentorProfileData:any;
  constructor(
    private routerParams: ActivatedRoute,
    private httpService: HttpService,
    private router: Router,
    private sessionService: SessionService,
    private userService: UserService,
    private localStorage:LocalStorageService,
    private toast:ToastService
  ) {
    routerParams.params.subscribe(params => {
      this.mentorId = this.buttonConfig.meta.id = params.id;
      this.userService.getUserValue().then(async (result) => {
        if (result || window['env']['isAuthBypassed']) {
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
    this.mentorProfileData = await this.getMentorDetails()
    this.isloaded = true
    this.userCantAccess = this.mentorProfileData?.responseCode == 'OK' ? false:true
      this.detailData.data = this.mentorProfileData?.result;
      this.detailData.data.organizationName = this.mentorProfileData?.result?.organization.name;
  }

  async getMentorDetails(){
    const config = {
      url: urlConstants.API_URLS.MENTORS_PROFILE_DETAILS + this.mentorId,
      payload: {}
    };
    try {
      let data = await this.httpService.get(config);
      return data;
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
        this.router.navigate([`/${CommonRoutes.SESSIONS_DETAILS}/${event.data.id}`]);
        break;

      case 'joinAction':
        await this.sessionService.joinSession(event.data);
        this.upcomingSessions = await this.sessionService.getUpcomingSessions(this.mentorId);
        break;

        case 'enrollAction':
        let enrollResult = await this.sessionService.enrollSession(event.data.id);
        if(enrollResult.result){
          this.toast.showToast(enrollResult.message, "success")
          this.upcomingSessions = await this.sessionService.getUpcomingSessions(this.mentorId);
        }
        break;
    }
  }
}
