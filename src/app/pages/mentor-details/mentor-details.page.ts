import { DataSource } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { SKELETON } from 'src/app/core/constants/skeleton.constant';
import {
  HttpService,
  LocalStorageService,
  ToastService,
  UserService,
  UtilService,
} from 'src/app/core/services';
import { Clipboard } from '@capacitor/clipboard';
import { SessionService } from 'src/app/core/services/session/session.service';
import { CommonRoutes } from 'src/global.routes';
import { Location } from '@angular/common';
import * as _ from 'lodash';
import { TitleCasePipe } from '@angular/common';

@Component({
    selector: 'app-mentor-details',
    templateUrl: './mentor-details.page.html',
    styleUrls: ['./mentor-details.page.scss'],
    standalone: false
})
export class MentorDetailsPage implements OnInit {
  mentorName;
  mentorId;
  page = 1;
  limit = 100;
  totalCount = 0;
  isdisabled:boolean;
  connected;
  public isMobile: any;
  currentUserId: any;
  public headerConfig: any = {
    backButton: false,
    headerColor: "primary",
    popOver: true,
    actions : []
  };
  disableInfiniteScroll: boolean = false;

  public buttonConfig = {
    meta: {
      id: null,
    },
    buttons: [
    {
      label: 'CHAT',
      action: 'chat',
      isHide: false
    },
          {
            label: 'REQUEST_SESSION',
            action: 'requestSession',
             isHide: false
          },
  ],
  };

  detailData: any = {
    controls: [],
    data:  {
    }
  };

  userCantAccess?: boolean = false;
  isloaded: boolean = false;
  segmentValue = 'about';
  upcomingSessions = [];
  mentorProfileData: any;
  userNotFound: boolean = false;
  userCanAccess: boolean;
  isLoading = false;
  isUpcomingSession: boolean =false; 
  SKELETON = SKELETON;
  constructor(
    private routerParams: ActivatedRoute,
    private httpService: HttpService,
    private router: Router,
    private sessionService: SessionService,
    private userService: UserService,
    private localStorage: LocalStorageService,
    private toast: ToastService,
    private utilService: UtilService, 
    private location: Location,
  ) {}

  ngOnInit() {}
  async ionViewWillEnter() {
    this.isMobile = this.utilService.isMobile();
    if(this.isLoading)
      return;
    this.isLoading = true;
    this.isUpcomingSession = false;
    let user = await this.localStorage.getLocalData(localKeys.USER_DETAILS)
    this.routerParams.params.subscribe((params) => {
      this.mentorId = this.buttonConfig.meta.id = params.id;
      this.getMentor();
    })
    this.currentUserId = user.id
    this.updateButtonConfig();
    this.page = 1;
    this.upcomingSessions = [];
    if(this.mentorProfileData?.result?.is_mentor){
    await this.getUpcomingSessions();
    }
    this.isLoading = false;
  }

  async getMentor() {
    let user = await this.localStorage.getLocalData(localKeys.USER_DETAILS);
    this.mentorProfileData = await this.getMentorDetails();
    this.updateButtonConfig();
    this.isloaded = true;
    this.detailData.controls = this.mentorProfileData?.result?.displayProperties;
    this.detailData.data = this.mentorProfileData?.result;
    this.detailData.data.organizationName =
      this.mentorProfileData?.result?.organization?.name || '';
    // this.headerConfig.share = this.detailData.data?.is_mentor;
     this.mentorName = new TitleCasePipe().transform(this.mentorProfileData.result.username);
    this.headerConfig.actions = []; 

    if (this.mentorProfileData.result.is_connected) {
        this.headerConfig.actions.push("block", "share");
    } else {
        this.headerConfig.actions.push("share");
           }
  }

  async getUpcomingSessions(isLoadMore: boolean = false) {
    const config = {
      url: urlConstants.API_URLS.UPCOMING_SESSIONS + this.mentorId + "?page=" + this.page + '&limit=' + this.limit,
      payload: {}
    };
    try {
      let data = await this.httpService.get(config);
      const newSessions = data?.result?.data || [];
      this.isUpcomingSession = true;
      if (isLoadMore) {
        this.upcomingSessions = [...this.upcomingSessions, ...newSessions];
      } else {
        this.upcomingSessions = newSessions;
      }

      
      this.totalCount = data?.result?.count || 0;
      
      if (!this.disableInfiniteScroll) {
        this.disableInfiniteScroll = this.upcomingSessions.length >= this.totalCount;
      }
    }
    catch (error) {
      console.error('Error fetching upcoming sessions:', error);
      this.disableInfiniteScroll = true;
    }
  }

  async getMentorDetails() {
    const config = {
      url: urlConstants.API_URLS.GET_PROFILE_DATA + this.mentorId,
      payload: {},
    };
    try {
      const data = await this.httpService.get(config);
      if (data) {
        this.userCanAccess = true;
      }
      return data;
    } catch (error: any) {
      switch (error?.status) {
       
      case 404:
        this.userNotFound = true;
        break;

      case 403:
        this.userCantAccess = true;
        break;

      default:
        this.toast.showToast('SOMETHING_WENT_WRONG', 'danger');
        this.location.back();
        break;
    }
    }
  }


  goToHome() {
    this.router.navigate([`/${CommonRoutes.TABS}/${CommonRoutes.HOME}`]);
  }

  async segmentChanged(ev: any) {
    this.segmentValue = ev.detail.value;
    this.isUpcomingSession = false;
    if(this.segmentValue == 'upcoming'){
      this.page = 1;
      this.upcomingSessions = [];
      await this.getUpcomingSessions();
    }
  }
  
  action(event) {
    switch (event) {
      case 'share':
        this.share();
        break;

      case 'block':
        this.block(this.mentorId);
        break;
    }
  }
  
  async share() {
    if(this.isMobile && navigator.share){
          let url = `/mentoring/${CommonRoutes.MENTOR_DETAILS}/${this.buttonConfig.meta.id}`;
          let link = this.utilService.getDeepLink(url);
          let params = {
            link: link,
            subject: "Profile Share",
            text: '',
          };
          await this.utilService.shareLink(params);
        } else {
          await this.copyToClipBoard(window.location.href);
          this.toast.showToast('PROFILE_LINK_COPIED', 'success');
        }     
  }
   async block(mentorId) {
    const userId = mentorId;

    const result = await this.utilService.alertPopup({
    header: "CONFIRM_BLOCK_HEADER",   
    message: "CONFIRM_BLOCK_MESSAGE", 
    submit: "BLOCK",
    cancel: "CANCEL",
    swapButtons: true
  },
   {name: this.mentorName}
  );

  if (result) {
    // const payload = {
    //       url:urlConstants.block,
    //       payload: {user_id: userId},
    //       };
    //     this.httpService.post(payload)
    
        this.toast.showToast("BLOCK_TOAST_MESSAGE","success", 5000,[],undefined, {name:this.mentorName})
        this.isdisabled=true;
             }           
}  
  
  copyToClipBoard = async (copyData: any) => {
    await Clipboard.write({
      string: copyData,
    }).then(() => {
      this.toast.showToast('COPIED', 'success');
    });
  };
  
  async onAction(event) {
    switch (event.type) {
      case 'cardSelect':
        this.router.navigate([`/${CommonRoutes.SESSIONS_DETAILS}/${event.data.id}`],{replaceUrl:true});
        break;

      case 'joinAction':
        await this.sessionService.joinSession(event.data);
        this.page = 1;
        this.isUpcomingSession =false;
        this.upcomingSessions = [];
        await this.getUpcomingSessions();
        break;

      case 'enrollAction':
        let enrollResult = await this.sessionService.enrollSession(event.data.id);
        if(enrollResult.result){
          this.toast.showToast(enrollResult.message, "success")
          this.page = 1;
          this.isUpcomingSession =false;
          this.upcomingSessions = [];
          await this.getUpcomingSessions();
        }
        break;
    }
  }
  
   updateButtonConfig() {
    this.buttonConfig.buttons = !this.mentorProfileData?.result?.is_mentor
      ? [
          {
            label: 'CHAT',
            action: 'chat',
             isHide: false
          },
        ]
      : [
          {
            label: 'CHAT',
            action: 'chat',
             isHide: false
          },
          {
            label: 'REQUEST_SESSION',
            action: 'requestSession',
             isHide: false
          },
        ];
        if (String(this.mentorProfileData?.result?.id) === String(this.currentUserId)) {
            this.buttonConfig.buttons = this.buttonConfig.buttons.map(btn => ({
                   ...btn,isHide: true
            }));
           }
  }

  unblock(){
    this.isdisabled=false;
    // implement the api function
  }

  async loadMore(event) {
    this.page += 1;
    await this.getUpcomingSessions(true);
    event.target.complete();
  }
}