import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonModal } from '@ionic/angular';
import * as moment from 'moment';
import { PLATFORMS } from 'src/app/core/constants/formConstant';
import { HttpService, ToastService, UtilService } from 'src/app/core/services';
import { FormService } from 'src/app/core/services/form/form.service';
import { SessionService } from 'src/app/core/services/session/session.service';
import { DynamicFormComponent } from 'src/app/shared/components';
import { CommonRoutes } from 'src/global.routes';


@Component({
    selector: 'app-session-request-details',
    templateUrl: './session-request-details.page.html',
    styleUrls: ['./session-request-details.page.scss'],
    standalone: false
})
export class SessionRequestDetailsPage implements OnInit {
  private readonly form = inject(FormService);
  private readonly sessionService = inject(SessionService);
  private readonly toast = inject(ToastService);
  private readonly utilService = inject(UtilService);
  private readonly activateRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpService);

  @ViewChild('platformForm') platformForm: DynamicFormComponent;
  @ViewChild(IonModal) modal!: IonModal;
  readonly showFullText = signal(false);
  readonly isAccepted = signal(false);
  meetingPlatforms: any[] = [];
  selectedLink: any;
  selectedHint = '';
  readonly editSessionBtn = signal(false);
  readonly isMeetingLinkAdded = signal(false);
  readonly isModalOpen = signal(false);
  readonly isRejected = signal(false);
  readonly params = signal<any>({});
  readonly apiResponse = signal<any>(null);
  readonly scheduledSessionDetals = signal<any[]>([]);
  meetingInfo: {
    meeting_info: {
      platform: any;
      link: any;
      value: any;
      meta: { password: any; meetingId: any };
    };
  };
  readonly sessionId = signal<any>(null);
  readonly sessionDetails = signal<any>(null);
  readonly isEnabled = signal(false);
  readonly userId = signal<string | null>(null);

  constructor() {}
  public headerConfig: any = {
    backButton: true,
    headerColor: 'primary'
  };

  ngOnInit() { }

  ionViewWillEnter() {
    this.getPlatformFormDetails();
    this.userId.set(localStorage.getItem('userId'));
    this.activateRoute.queryParams.subscribe((params) => {
      this.params.set(params);
      this.loadRequestDetails(params.id);
    });
    this.getAllUpdatedSession();
  }

  private async loadRequestDetails(id: any): Promise<void> {
    const res = await this.sessionService.getReqSessionDetails(id);
    this.apiResponse.set(res.result);
    if (this.apiResponse()?.status === 'ACCEPTED') {
      const sessionRes = await this.sessionService.getSessionDetailsAPI(this.apiResponse()?.session_id);
      this.sessionDetails.set(sessionRes.result);
      this.isMeetingLinkAdded.set(true);
      const currentTimeInSeconds = Math.floor(Date.now() / 1000);
      const details = this.sessionDetails();
      this.isEnabled.set(
        ((details.start_date - currentTimeInSeconds) < 600 || details?.status?.value === 'LIVE')
      );
    }
  }

  getAllUpdatedSession() {
    const currentEpoch = Math.floor(Date.now() / 1000);
    const thirtyDaysLaterEpoch = Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000);
    this.sessionService.requestSessionUserAvailability(currentEpoch, thirtyDaysLaterEpoch).then((res) => {
      this.scheduledSessionDetals.set(res.result);
    });
  }

  toggleText() {
    this.showFullText.update((value) => !value);
  }

  accept(id: any) {
    this.sessionService.requestSessionAccept(id).then((res) => {
      if (res) {
        this.isAccepted.set(true);
        this.toast.showToast(res.message, 'success');
        this.sessionService.getReqSessionDetails(this.params().id).then((requestRes) => {
          this.apiResponse.set(requestRes.result);
          if (requestRes) {
            this.getAllUpdatedSession();
            this.sessionService.getSessionDetailsAPI(this.apiResponse().session_id).then((sessionRes) => {
              this.sessionDetails.set(sessionRes.result);
            });
          } 
        });
      }
    });
  }

  async reject(id: any, name: string) {
    const msg = {
      header: 'Reject ?',
      message: 'Are you sure you want to reject this session request?',
      cancel: 'CANCEL',
      submit: 'Reject',
      inputs: [
        {
          name: 'reason',  
          type: 'textarea',
          placeholder: `Let ${name} know why you are rejecting their slot...`,
        }
      ]
    };
    if (!(await this.http.checkNetworkAvailability())) {
      return;
    }
    const response:any = await this.utilService.alertPopup(msg);
    if (response) {
      this.sessionService.requestSessionReject(id, response?.reason).then((res) => {
        if (res) {
          this.isRejected.set(true);
          this.sessionService.getReqSessionDetails(this.params().id).then((requestRes) => {
            this.apiResponse.set(requestRes.result);
          });
          this.toast.showToast(res.message, 'danger');
        }
      });
    } else {
      console.log('User canceled the rejection');
    }
  }

  addLink(isOpen: boolean, id: any) {
    this.isModalOpen.set(isOpen);
    this.sessionId.set(id);
  }

 async getPlatformFormDetails() {
    const form = await this.form.getForm(PLATFORMS);
    this.meetingPlatforms = form.data.fields.forms;
    this.selectedLink = this.meetingPlatforms[0];
    this.selectedHint = this.meetingPlatforms[0].hint;
  }
  clickOptions(event: any) {
    this.selectedHint = event.detail.value.hint;
  }
  compareWithFn(o1: any, o2: any) {
    return o1 === o2;
  }

  addNow() {
    this.modal.dismiss();
    this.isModalOpen.set(false);
    if (this.platformForm?.myForm?.valid) {
      this.meetingInfo = {
        meeting_info: {
          platform: this.selectedLink.name,
          link: this.platformForm.myForm.value?.link,
          value: this.selectedLink.value,
          meta: {
            password: this.platformForm.myForm.value?.password,
            meetingId: this.platformForm.myForm.value?.meetingId
          }
        }
      };
    }
    this.sessionService.createSession(this.meetingInfo, this.sessionId()).then((res) => {
      if (res) {
        this.sessionService.getReqSessionDetails(this.params().id).then((requestRes) => {
          this.apiResponse.set(requestRes.result);
          if (this.apiResponse()?.status === 'ACCEPTED') {
            this.sessionService.getSessionDetailsAPI(this.apiResponse().session_id).then((sessionRes) => {
              this.sessionDetails.set(sessionRes.result);
              this.isMeetingLinkAdded.set(true);
            });
          }
        });
      }
    });
    this.editSessionBtn.set(true);
  }

  editLink(isOpen: boolean, id: any) {
    if (!this.sessionDetails()?.meeting_info) {
      return;
    }

    this.isModalOpen.set(isOpen);
    this.sessionId.set(id);
    for (let j = 0; j < this?.meetingPlatforms?.length; j++) {
      if (this.sessionDetails().meeting_info.platform === this?.meetingPlatforms[j].name) {
        this.selectedLink = this?.meetingPlatforms[j];
        this.selectedHint = this.meetingPlatforms[j].hint;
        const obj = this?.meetingPlatforms[j]?.form?.controls.find((link: any) => link?.name === 'link');
        const meetingId = this?.meetingPlatforms[j]?.form?.controls.find((meet: any) => meet?.name === 'meetingId');
        const password = this?.meetingPlatforms[j]?.form?.controls.find((pass: any) => pass?.name === 'password');
        if (obj && this.sessionDetails()?.meeting_info?.link) {
          obj.value = this.sessionDetails()?.meeting_info?.link;
        }
        if (this.sessionDetails()?.meeting_info?.meta?.meetingId) {
          meetingId.value = this.sessionDetails()?.meeting_info?.meta?.meetingId;
          password.value = this.sessionDetails()?.meeting_info?.meta?.password;
        }
      }
    }
  }

  addLater() {
    this.modal.dismiss();
    this.isModalOpen.set(false);
  }

  viewProfile(id: any) {
    this.router.navigate([CommonRoutes.MENTOR_DETAILS, id]);
  }

  async onStart(data) {
    const result = await this.sessionService.startSession(data);
    if (result) {
      this.router.navigate([`/${CommonRoutes.TABS}/${CommonRoutes.HOME}`]);
    }
  }

  formatUnixTime(unixTimestamp: number): string {
    return moment.unix(unixTimestamp).format('h:mm A');
  }

}
