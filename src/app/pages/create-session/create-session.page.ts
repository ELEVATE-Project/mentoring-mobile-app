import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AttachmentService, LoaderService, ToastService } from 'src/app/core/services';
import { HttpService } from 'src/app/core/services/http/http.service';
import { SessionService } from 'src/app/core/services/session/session.service';
import {
  DynamicFormComponent,
  JsonFormData,
} from 'src/app/shared/components/dynamic-form/dynamic-form.component';
import { CommonRoutes } from 'src/global.routes';
import * as _ from 'lodash-es';
import { Location } from '@angular/common';
import { AlertController, Platform } from '@ionic/angular';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { CREATE_SESSION_FORM, PLATFORMS } from 'src/app/core/constants/formConstant';
import { FormService } from 'src/app/core/services/form/form.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-create-session',
  templateUrl: './create-session.page.html',
  styleUrls: ['./create-session.page.scss'],
})
export class CreateSessionPage implements OnInit {
  lastUploadedImage: boolean;
  private win: any = window;
  @ViewChild('form1') form1: DynamicFormComponent;
  @ViewChild('platformForm') platformForm: DynamicFormComponent;
  id: any = null;
  localImage;
  path;
  public headerConfig: any = {
    // menu: true,
    backButton: {
      label: '',
    },
    notification: false,
  };
  profileImageData: any = {
    type: 'session',
    haveValidationError: false
  }

  public formData: JsonFormData;
  showForm: boolean = false;
  isSubmited: boolean;
  type: any ;
  selectedLink: any;
  selectedHint: any;
  meetingPlatforms:any ;
  firstStepperTitle: string;
  sessionDetails: any;
  entityNames:any
  entityList:any;

  constructor(
    private http: HttpClient,
    private sessionService: SessionService,
    private toast: ToastService,
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private attachment: AttachmentService,
    private platform: Platform,
    private api: HttpService,
    private loaderService: LoaderService,
    private translate: TranslateService,
    private alert: AlertController,
    private form: FormService,
    private changeDetRef: ChangeDetectorRef,
    private router: Router
  ) {
  }
  async ngOnInit() {
    const platformForm = await this.getPlatformFormDetails();
    const result = await this.form.getForm(CREATE_SESSION_FORM);
    this.formData = _.get(result, 'data.fields');
    this.entityNames = await this.form.getEntityNames(this.formData)
    this.entityList = await this.form.getEntities(this.entityNames)
    this.formData = await this.form.populateEntity(this.formData,this.entityList)
    this.changeDetRef.detectChanges();
    this.activatedRoute.queryParamMap.subscribe(async (params) => {
      this.id = params?.get('id');
      this.headerConfig.label = this.id ? "EDIT_SESSION":"CREATE_NEW_SESSION";
      this.type = params?.get('type')? params?.get('type'): 'default';
      this.firstStepperTitle = (this.id) ? "EDIT_SESSION_LABEL":"CREATE_NEW_SESSION";
      if (this.id) {
        await this.getSessionDetailsUpdate()
      } else {
        this.showForm = true;
      }
    });
    this.isSubmited = false; //to be removed
    this.profileImageData.isUploaded = true;
    this.changeDetRef.detectChanges();
  }
  async getSessionDetailsUpdate(){
    let response = await this.sessionService.getSessionDetailsAPI(this.id);
        this.sessionDetails= response;
        this.profileImageData.image = response.image;
        this.profileImageData.isUploaded = true;
        response.start_date = moment.unix(response.start_date).format("YYYY-MM-DDTHH:mm");
        response.end_date = moment.unix(response.end_date).format("YYYY-MM-DDTHH:mm");
        this.preFillData(response);
  }

  async getPlatformFormDetails() {
    let form = await this.form.getForm(PLATFORMS);
    this.meetingPlatforms = form.data.fields.forms;
    this.selectedLink = this.meetingPlatforms[0];
    this.selectedHint = this.meetingPlatforms[0].hint;
  }

  async canPageLeave() {
    if(this.type=='default'){
      if (!this.form1?.myForm.pristine || this.profileImageData.haveValidationError) {
        let texts: any;
        this.translate.get(['SESSION_FORM_UNSAVED_DATA', 'EXIT', 'CANCEL', 'EXIT_HEADER_LABEL']).subscribe(text => {
          texts = text;
        })
        const alert = await this.alert.create({
          header: texts['EXIT_HEADER_LABEL'],
          message: texts['SESSION_FORM_UNSAVED_DATA'],
          buttons: [
            {
              text: texts['EXIT'],
              cssClass: "alert-button-bg-white",
              role: 'exit',
              handler: () => { }
            },
            {
              text: texts['CANCEL'],
              cssClass: "alert-button-red",
              role: 'cancel',
              handler: () => { }
            }
          ]
        });
        await alert.present();
        let data = await alert.onDidDismiss();
        if(data.role == 'exit'){
          return true
        } 
        return false
      } else {
        return true;
      }
    }
    return true
  }


  async onSubmit() {
    if(!this.isSubmited){
      this.form1.onSubmit();
    }
    if (this.form1.myForm.valid) {
      if (this.profileImageData.image && !this.profileImageData.isUploaded) {
        this.getImageUploadUrl(this.localImage);
      } else {
        const form = Object.assign({}, this.form1.myForm.value);
        form.start_date = new Date(form.start_date).getTime() / 1000.0;
        form.end_date = new Date(form.end_date).getTime() / 1000.0;
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        form.time_zone = timezone;
        _.forEach(this.entityNames, (entityKey) => {
          form[entityKey] = _.map(form[entityKey], 'value');
        });
        if(!this.profileImageData.image){
          form.image=[]
        }
        this.form1.myForm.markAsPristine();
        let result = await this.sessionService.createSession(form, this.id);
        if (result) {
          this.sessionDetails = _.isEmpty(result) ? this.sessionDetails : result;
          this.isSubmited = true;
          this.firstStepperTitle = (this.id) ? "EDIT_SESSION_LABEL":"CREATE_NEW_SESSION";
          this.headerConfig.label = this.id ? "EDIT_SESSION":"CREATE_NEW_SESSION";
          result.start_date = moment.unix(result.start_date).format("YYYY-MM-DDTHH:mm");
          result.end_date = moment.unix(result.end_date).format("YYYY-MM-DDTHH:mm");
          if(!this.id && result.id){
            this.router.navigate([CommonRoutes.CREATE_SESSION], { queryParams: { id: result.id , type: 'segment'}, replaceUrl: true });
          }else {
            this.type = 'segment';
          }
        } else {
          this.profileImageData.image = this.lastUploadedImage;
          this.profileImageData.isUploaded = false;
        }
      }
    } else {
      this.toast.showToast("Please fill all the mandatory fields", "danger");
    }
  }

  async getImageUploadUrl(file) {
    this.loaderService.startLoader();
    let config = {
      url: urlConstants.API_URLS.GET_SESSION_IMAGE_UPLOAD_URL + file.name.replace(/[^A-Z0-9]+/ig, "_").toLowerCase()
    }
    let data: any = await this.api.get(config);
    return this.upload(file, data.result).subscribe()
  }

  upload(data, uploadUrl) {
    return this.attachment.cloudImageUpload(data,uploadUrl).pipe(
      map((resp=>{
      this.profileImageData.image = uploadUrl.destFilePath;
      this.form1.myForm.value.image = [uploadUrl.destFilePath];
      this.profileImageData.isUploaded = true;
      this.profileImageData.haveValidationError = false;
      this.onSubmit();
    })))
  }

  resetForm() {
    this.form1.reset();
  }

  async preFillData(data) {
    let existingData = await this.form.formatEntityOptions(data,this.entityNames)

    for(let j=0;j<this?.meetingPlatforms?.length;j++){
      if( existingData.meeting_info.platform == this?.meetingPlatforms[j].name){
         this.selectedLink = this?.meetingPlatforms[j];
         this.selectedHint = this.meetingPlatforms[j].hint;
        let obj = this?.meetingPlatforms[j]?.form?.controls.find( (link:any) => link?.name == 'link')
        let meetingId = this?.meetingPlatforms[j]?.form?.controls.find( (meetingId:any) => meetingId?.name == 'meetingId')
        let password = this?.meetingPlatforms[j]?.form?.controls.find( (password:any) => password?.name == 'password')
        if(existingData.meeting_info.link){
          obj.value = existingData?.meeting_info?.link;
        }
        if(existingData?.meeting_info?.meta?.meetingId){
          meetingId.value = existingData?.meeting_info?.meta?.meetingId;
          password.value = existingData?.meeting_info?.meta?.password;
        }
      }
    }
    
    for (let i = 0; i < this.formData.controls.length; i++) {
      this.formData.controls[i].value =
        existingData[this.formData.controls[i].name];
      this.formData.controls[i].options = _.unionBy(
        this.formData.controls[i].options,
        this.formData.controls[i].value, 'value'
      );
    }
    this.showForm = true;
  }

  async imageUploadEvent(event) {
    this.localImage = event.target.files[0];
    var reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]);
    reader.onload = (file: any) => {
      this.profileImageData.image = this.lastUploadedImage = file.target.result
      this.profileImageData.isUploaded = false;
      this.profileImageData.haveValidationError = true;
    }
  }

  imageRemoveEvent(event){
    this.profileImageData.image = '';
    this.form1.myForm.value.image ='';
    this.form1.myForm.markAsDirty();
    this.profileImageData.isUploaded = true;
    this.profileImageData.haveValidationError = false;
  }
  async segmentChanged(event){
    this.type = event.target.value;
    if(this.id){
      this.getSessionDetailsUpdate();
    }
  }
  isValid(event){
    this.isSubmited = event;
  }
  clickOptions(event:any){
    this.selectedHint = event.detail.value.hint;
  }
  setItLater(){
    this.id ? this.router.navigate([`/${"session-detail"}/${this.id}`], {replaceUrl: true}): this.location.back();
    
  }
  onSubmitLink(){
    if (this.platformForm.myForm.valid){
      let meetingInfo = {
        'meeting_info':{
          'platform': this.selectedLink.name,
          'link': this.platformForm.myForm.value?.link,
          'value': this.selectedLink.value,
          "meta": {
            "password": this.platformForm.myForm.value?.password,
            "meetingId":this.platformForm.myForm.value?.meetingId
        }

      }}
      this.sessionService.createSession(meetingInfo,this.id).then(()=>{
        this.router.navigate([`/${"session-detail"}/${this.id}`],{replaceUrl: true})
      })
    }
  }
  compareWithFn(o1, o2) {
    return o1 === o2;
  };
}