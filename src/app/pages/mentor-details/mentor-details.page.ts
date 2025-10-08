import { DataSource } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
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
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-mentor-details',
  templateUrl: './mentor-details.page.html',
  styleUrls: ['./mentor-details.page.scss'],
})
export class MentorDetailsPage implements OnInit {
  mentorName;
  mentorId;
  isdisabled:boolean=true;
  connected;
  public isMobile: any;
  currentUserId: any;
  public headerConfig: any = {
    backButton: false,
    headerColor: "primary",
    popOver: true,
    actions : []
  };

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
    form: [
      {
        title: 'ABOUT',
        key: 'about',
      },
      {
        title: 'DESIGNATION',
        key: 'designation',
      },
      {
        title: 'ORGANIZATION',
        key: 'organizationName',
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
        title: 'EDUCATION_QUALIFICATION',
        key: 'education_qualification',
      },
      {
        title: 'LANGUAGES',
        key: 'languages',
      },
    ],
    data: {
      rating: {
        average: 0,
      },
      sessions_hosted: 0,
      organizationName: '',
    },
  };
  userCantAccess?: boolean = false;
  isloaded: boolean = false;
  segmentValue = 'about';
  upcomingSessions;
  mentorProfileData: any;
  userNotFound: boolean = false;
  userCanAccess: boolean;
  showDetails: boolean = true;
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
    this.routerParams.params.subscribe((params) => {
      this.mentorId = this.buttonConfig.meta.id = params.id;
      this.getMentor();
    })
    let user = await this.localStorage.getLocalData(localKeys.USER_DETAILS)
    this.currentUserId= user.id
    this.updateButtonConfig();
  }

  async getMentor() {
    let user = await this.localStorage.getLocalData(localKeys.USER_DETAILS);
    this.mentorProfileData = await this.getMentorDetails();
    this.updateButtonConfig();
    this.isloaded = true;
    this.detailData.data = this.mentorProfileData?.result;
    console.log(this.detailData.data, "data at 128")
    this.detailData.data.organizationName =
      this.mentorProfileData?.result?.organization?.name || '';
    // this.headerConfig.share = this.detailData.data?.is_mentor;
     this.mentorName = new TitleCasePipe().transform(this.mentorProfileData.result.username);
     this.mentorProfileData.result.is_connected ?  this.headerConfig.actions.push("block", "share") : this.headerConfig.actions.push("share");
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
    if(this.upcomingSessions) return;
    this.upcomingSessions =
      this.segmentValue == 'upcoming'
        ? await this.sessionService.getUpcomingSessions(this.mentorId)
        : [];
  }

  action(event) {
    switch (event) {
      case 'share':
        this.share();
        break;

      case 'block':
        this.block(this.mentorId);
        console.log("block received 170");
        break;
    }
  }
  async share() {
    if(this.isMobile && navigator.share){
          let url = `/mentoring/${CommonRoutes.MENTOR_DETAILS}/${this.buttonConfig.meta.id}`;
          let link = await this.utilService.getDeepLink(url);
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

    console.log(userId, "userId id value line 195")
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
    console.log( "funtion triggered!!!", userId);
    // const payload = {
    //       url:urlConstants.block,
    //       payload: {user_id: userId},
    //       };
    //     this.httpService.post(payload)
    
        this.toast.showToast("BLOCK_TOAST_MESSAGE","success", 5000,[],undefined, {name:this.mentorName})
        this.isdisabled=false;
       this.showDetails= false;
            }  else {
                    console.log("User cancelled unblock.");
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
        this.upcomingSessions = await this.sessionService.getUpcomingSessions(
          this.mentorId
        );
        break;

      case 'enrollAction':
        let enrollResult = await this.sessionService.enrollSession(
          event.data.id
        );
        if (enrollResult.result) {
          this.toast.showToast(enrollResult.message, 'success');
          this.upcomingSessions = await this.sessionService.getUpcomingSessions(
            this.mentorId
          );
        }
        break;
    }
  }
  private updateButtonConfig() {
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
    console.log("unblock button working");
    // implement the api function
  }
}
