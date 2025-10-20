import { DataSource } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonInfiniteScroll } from '@ionic/angular';
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
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  mentorId;
  page = 1;
  limit = 100;
  totalCount = 0;
  public headerConfig: any = {
    backButton: false,
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
        title: 'ABOUT',
        key: 'about',
      },
      {
        title: "DESIGNATION",
        key: "designation"
      },
      {
        title: "ORGANIZATION",
        key: "organizationName"
      },
      {
        title: 'YEAR_OF_EXPERIENCE',
        key: 'experience',
      },
      {
        title: 'KEY_AREAS_OF_EXPERTISE',
        key: 'area_of_expertise',
      },
      {
        title: "EDUCATION_QUALIFICATION",
        key: "education_qualification"
      },
      {
        title: "LANGUAGES",
        key: "languages" 
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
  upcomingSessions: any = [];
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
      this.getMentor();
    })
  }

  ngOnInit() {
  }
  async ionViewWillEnter(){
    this.page = 1;
    this.upcomingSessions = [];
    this.getUpcomingSessions();
  }
  async getMentor() {
    let user = await this.localStorage.getLocalData(localKeys.USER_DETAILS);
    this.mentorProfileData = await this.getMentorDetails()
    this.isloaded = true
    this.userCantAccess = this.mentorProfileData?.responseCode == 'OK' ? false:true
      this.detailData.data = this.mentorProfileData?.result;
      this.detailData.data.organizationName = this.mentorProfileData?.result?.organization.name;
  }
  async getUpcomingSessions() {
    const config = {
      url: urlConstants.API_URLS.UPCOMING_SESSIONS + this.mentorId + "?page="+this.page + '&limit='+this.limit,
      payload: {}
    };
    try {
      let data = await this.httpService.get(config);
      this.upcomingSessions = this.upcomingSessions.concat(data.result.data);
      this.totalCount = data.result.count;
      this.infiniteScroll.disabled = (this.upcomingSessions.length === this.totalCount) ? true : false;
    }
    catch (error) {
    }
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
    if(this.segmentValue == 'upcoming'){
      this.page = 1;
      this.upcomingSessions = [];
      this.getUpcomingSessions();
    }
  }
  async onAction(event){
    switch (event.type) {
      case 'cardSelect':
        this.router.navigate([`/${CommonRoutes.SESSIONS_DETAILS}/${event.data.id}`],{replaceUrl:true});
        break;

      case 'joinAction':
        await this.sessionService.joinSession(event.data);
        this.page = 1;
        this.upcomingSessions = [];
        this.getUpcomingSessions();
        break;

        case 'enrollAction':
        let enrollResult = await this.sessionService.enrollSession(event.data.id);
        if(enrollResult.result){
          this.toast.showToast(enrollResult.message, "success")
          this.page = 1;
          this.upcomingSessions = [];
          this.getUpcomingSessions();
        }
        break;
    }
  }

  loadMore(event){
    setTimeout(() => {
      this.page += 1;
      this.getUpcomingSessions();
      event.target.complete();
    }, 1000);
  }
}
