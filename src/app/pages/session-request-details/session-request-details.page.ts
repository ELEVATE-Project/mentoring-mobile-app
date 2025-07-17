import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonModal } from '@ionic/angular';
import * as moment from 'moment';
import { PLATFORMS } from 'src/app/core/constants/formConstant';
import { ToastService, UtilService } from 'src/app/core/services';
import { FormService } from 'src/app/core/services/form/form.service';
import { SessionService } from 'src/app/core/services/session/session.service';
import { DynamicFormComponent } from 'src/app/shared/components';
import { CommonRoutes } from 'src/global.routes';


@Component({
  selector: 'app-session-request-details',
  templateUrl: './session-request-details.page.html',
  styleUrls: ['./session-request-details.page.scss'],
})
export class SessionRequestDetailsPage implements OnInit {
  @ViewChild('platformForm') platformForm: DynamicFormComponent;
  @ViewChild(IonModal) modal!: IonModal;
  showFullText: boolean;
  isAccepted: boolean;
  meetingPlatforms: any;
  selectedLink: any;
  selectedHint: any;
  editSessionBtn: boolean = false;
  isMeetingLinkAdded: boolean =false;
  isModalOpen: boolean = false;
  isRejected: boolean = false;
  params: any;
  apiResponse: any;
  scheduledSessionDetals: any;
  meetingInfo: { meeting_info: { platform: any; link: any; value: any; meta: { password: any; meetingId: any; }; }; };
  sessionId: any;
  sessionDetails: any;
  isEnabled: boolean;

  constructor(
    private form: FormService,
    private sessionService: SessionService,
    private toast: ToastService,
    private utilService: UtilService,
    private activateRoute: ActivatedRoute,
    private router: Router
  ) { }
  public headerConfig: any = {
    backButton: true,
    headerColor: 'primary'
  };

  ngOnInit() { }

  ionViewWillEnter() {
    this.getPlatformFormDetails();
    this.activateRoute.queryParams.subscribe((params) => {this.params = params});
    this.sessionService.getReqSessionDetails(this.params.id).then((res) => {
      this.apiResponse = res.result;
      if (this.apiResponse?.status === 'ACCEPTED') {
        this.sessionService.getSessionDetailsAPI(this.apiResponse.session_id).then((res) => {
        
          this.sessionDetails = res.result;
          this.isMeetingLinkAdded = true;
          let currentTimeInSeconds=Math.floor(Date.now()/1000);
          this.isEnabled = ((this.sessionDetails.start_date - currentTimeInSeconds) < 600 || this.sessionDetails?.status?.value=='LIVE') ? true : false;
        })
      }
    });
    this.getAllUpdatedSession();
  }

  getAllUpdatedSession() {
    this.sessionService.requestSessionUserAvailability().then((res) => {
      this.scheduledSessionDetals = res.result;
    });
  }

  toggleText() {
    this.showFullText = !this.showFullText;
  }

  accept(id:any){
    
    this.sessionService.requestSessionAccept(id).then((res) => {
      if (res) {
        this.isAccepted = true;
        this.toast.showToast(res.message, 'success');
        this.sessionService.getReqSessionDetails(this.params.id).then((res) => {
          this.apiResponse = res.result;
          if(res){
            this.getAllUpdatedSession();
            this.sessionService.getSessionDetailsAPI(this.apiResponse.session_id).then((res) => {
              this.sessionDetails = res.result;
            })
          } 
        });
      }
    })
  }

  async reject(id:any, name: string) {  
    let msg = {
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
    const response:any = await this.utilService.alertPopup(msg);
    if (response) {
      this.sessionService.requestSessionReject(id, response?.reason).then((res) => {
        if (res) {
          this.isRejected = true;
          this.sessionService.getReqSessionDetails(this.params.id).then((res) => {
            this.apiResponse = res.result;});
          this.toast.showToast(res.message, 'danger');
        }
      })
    } else {
      console.log('User canceled the rejection');
    }
  }

  addLink(isOpen: boolean, id:any) {
    this.isModalOpen = isOpen;
    this.sessionId = id;
  }

 async getPlatformFormDetails() {
    let form = await this.form.getForm(PLATFORMS);
    this.meetingPlatforms = form.data.fields.forms;
    this.selectedLink = this.meetingPlatforms[0];
    this.selectedHint = this.meetingPlatforms[0].hint;
  }
  clickOptions(event:any){
    this.selectedHint = event.detail.value.hint;
  }
  compareWithFn(o1, o2) {
    return o1 === o2;
  };

  addNow(){
    this.modal.dismiss();
    this.isModalOpen =false;
    if (this.platformForm?.myForm?.valid){
      this.meetingInfo = {
        'meeting_info':{
          'platform': this.selectedLink.name,
          'link': this.platformForm.myForm.value?.link,
          'value': this.selectedLink.value,
          "meta": {
            "password": this.platformForm.myForm.value?.password,
            "meetingId":this.platformForm.myForm.value?.meetingId
        }

      }}
    }
    this.sessionService.createSession(this.meetingInfo,this.sessionId).then((res) => {
    if (res) {
      this.sessionService.getReqSessionDetails(this.params.id).then((res) => {
        this.apiResponse = res.result;
      });

      if (this.apiResponse?.status === 'ACCEPTED') {
        this.sessionService.getSessionDetailsAPI(this.apiResponse.session_id).then((res) => {
          this.sessionDetails = res.result;
          this.isMeetingLinkAdded = true;
        })
      }
    }});
    this.editSessionBtn = true;
  }

  editLink(isOpen: boolean, id:any) {
    this.isModalOpen = isOpen;
    this.sessionId = id;
    for(let j=0;j<this?.meetingPlatforms?.length;j++){
      if( this.sessionDetails.meeting_info.platform == this?.meetingPlatforms[j].name){
         this.selectedLink = this?.meetingPlatforms[j];
         this.selectedHint = this.meetingPlatforms[j].hint;
        let obj = this?.meetingPlatforms[j]?.form?.controls.find( (link:any) => link?.name == 'link')
        let meetingId = this?.meetingPlatforms[j]?.form?.controls.find( (meetingId:any) => meetingId?.name == 'meetingId')
        let password = this?.meetingPlatforms[j]?.form?.controls.find( (password:any) => password?.name == 'password')
        if(obj && this.sessionDetails?.meeting_info?.link){
          obj.value = this.sessionDetails?.meeting_info?.link;
        }
        if(this.sessionDetails?.meeting_info?.meta?.meetingId){
          meetingId.value = this.sessionDetails?.meeting_info?.meta?.meetingId;
          password.value = this.sessionDetails?.meeting_info?.meta?.password;
        }
      }
    }
  }

  addLater(){
    this.modal.dismiss();
    this.isModalOpen = false;
  }

  viewProfile(id: any){
    this.router.navigate([CommonRoutes.MENTOR_DETAILS, id]);
  }

  async onStart(data) {
    let result = await this.sessionService.startSession(data);
    result?this.router.navigate([`/${CommonRoutes.TABS}/${CommonRoutes.HOME}`]):null;
  }

  formatUnixTime(unixTimestamp: number): string {
    return moment.unix(unixTimestamp).format('h:mm A');
  }

}
