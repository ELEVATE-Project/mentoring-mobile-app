import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild, signal, WritableSignal, computed } from '@angular/core';
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
  mentorId = signal<any>(null);
  page = signal<number>(1);
  limit = 100;
  totalCount = signal<number>(0);
  isdisabled = signal<boolean>(false);
  connected;
  public isMobile = signal<boolean>(false);
  currentUserId = signal<any>(null);
  disableInfiniteScroll = signal<boolean>(false);

  mentorProfileData = signal<any>(null);
  
  mentorName = computed(() => {
    const data = this.mentorProfileData();
    return data?.result?.username ? new TitleCasePipe().transform(data.result.username) : '';
  });

  headerConfig = computed(() => {
    const data = this.mentorProfileData();
    const config = {
      backButton: false,
      headerColor: "primary",
      popOver: true,
      actions : []
    };
    if (data?.result?.is_connected) {
      config.actions.push("block", "share");
    } else {
      config.actions.push("share");
    }
    return config;
  });

  buttonConfig = computed(() => {
    const data = this.mentorProfileData();
    const isMentor = data?.result?.is_mentor;
    const mentorId = data?.result?.id;
    const currentUserId = this.currentUserId();

    let buttons = !isMentor
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

    const isOwnProfile = String(mentorId) === String(currentUserId);
    if (isOwnProfile) {
      buttons = buttons.map(btn => ({ ...btn, isHide: true }));
    }

    return {
      meta: { id: this.mentorId() },
      buttons: buttons
    };
  });

  detailData = computed(() => {
    const data = this.mentorProfileData();
    return {
      controls: data?.result?.displayProperties || [],
      data: {
        ...(data?.result || {}),
        organizationName: data?.result?.organization?.name || ''
      }
    };
  });

  userCantAccess = signal<boolean>(false);
  isloaded = signal<boolean>(false);
  segmentValue = signal<string>('about');
  upcomingSessions = signal<any[]>([]);
  userNotFound = signal<boolean>(false);
  userCanAccess = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  isUpcomingSession = signal<boolean>(false); 
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
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {}
  async ionViewWillEnter() {
    this.isMobile.set(this.utilService.isMobile());
    if(this.isLoading())
      return;
    this.isLoading.set(true);
    this.isUpcomingSession.set(false);
    let user = await this.localStorage.getLocalData(localKeys.USER_DETAILS)
    this.routerParams.params.subscribe((params) => {
      this.mentorId.set(params.id);
      this.getMentor();
    })
    this.currentUserId.set(user.id);
    this.page.set(1);
    this.upcomingSessions.set([]);
    if(this.mentorProfileData()?.result?.is_mentor){
      await this.getUpcomingSessions();
    }
    this.isLoading.set(false);
  }


  async getMentor() {
    const data = await this.getMentorDetails();
    if (data) {
      this.mentorProfileData.set(data);
      this.isloaded.set(true);
    }
  }


  async getUpcomingSessions(isLoadMore: boolean = false) {
    const config = {
      url: urlConstants.API_URLS.UPCOMING_SESSIONS + this.mentorId() + "?page=" + this.page() + '&limit=' + this.limit,
      payload: {}
    };
    try {
      let data = await this.httpService.get(config);
      const newSessions = data?.result?.data || [];
      this.isUpcomingSession.set(true);
      if (isLoadMore) {
        this.upcomingSessions.update(sessions => [...sessions, ...newSessions]);
      } else {
        this.upcomingSessions.set(newSessions);
      }

      
      this.totalCount.set(data?.result?.count || 0);
      
      if (!this.disableInfiniteScroll()) {
        this.disableInfiniteScroll.set(this.upcomingSessions().length >= this.totalCount());
      }
    }
    catch (error) {
      console.error('Error fetching upcoming sessions:', error);
      this.disableInfiniteScroll.set(true);
    }
  }

  async getMentorDetails() {
    const config = {
      url: urlConstants.API_URLS.GET_PROFILE_DATA + this.mentorId(),
      payload: {},
    };
    try {
      const data = await this.httpService.get(config);
      if (data) {
        this.userCanAccess.set(true);
      }
      return data;
    } catch (error: any) {
      switch (error?.status) {
       
      case 404:
        this.userNotFound.set(true);
        break;

      case 403:
        this.userCantAccess.set(true);
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
    this.segmentValue.set(ev.detail.value);
    this.isUpcomingSession.set(false);
    if(this.segmentValue() == 'upcoming'){
      this.page.set(1);
      this.upcomingSessions.set([]);
      await this.getUpcomingSessions();
    }
  }
  
  action(event) {
    switch (event) {
      case 'share':
        this.share();
        break;

      case 'block':
        this.block(this.mentorId());
        break;
    }
  }
  
  async share() {
    if(this.isMobile() && navigator.share){
          let url = `/mentoring/${CommonRoutes.MENTOR_DETAILS}/${this.buttonConfig().meta.id}`;
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
   {name: this.mentorName()}
  );

  if (result) {
    // const payload = {
    //       url:urlConstants.block,
    //       payload: {user_id: userId},
    //       };
    //     this.httpService.post(payload)
    
        this.toast.showToast("BLOCK_TOAST_MESSAGE","success", 5000,[],undefined, {name:this.mentorName()})
        this.isdisabled.set(true);
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
        this.page.set(1);
        this.isUpcomingSession.set(false);
        this.upcomingSessions.set([]);
        await this.getUpcomingSessions();
        break;

      case 'enrollAction':
        let enrollResult = await this.sessionService.enrollSession(event.data.id);
        if(enrollResult.result){
          this.toast.showToast(enrollResult.message, "success")
          this.page.set(1);
          this.isUpcomingSession.set(false);
          this.upcomingSessions.set([]);
          await this.getUpcomingSessions();
        }
        break;
    }
  }
  


  unblock(){
    this.isdisabled.set(false);
    // implement the api function
  }

  async loadMore(event) {
    this.page.update(p => p + 1);
    await this.getUpcomingSessions(true);
    event.target.complete();
  }
}