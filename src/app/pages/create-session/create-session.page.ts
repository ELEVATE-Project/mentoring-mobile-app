import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AttachmentService, LoaderService, ToastService, UtilService } from 'src/app/core/services';
import { HttpService } from 'src/app/core/services/http/http.service';
import { SessionService } from 'src/app/core/services/session/session.service';
import {
  DynamicFormComponent,
  JsonFormData,
} from 'src/app/shared/components/dynamic-form/dynamic-form.component';
import { CommonRoutes } from 'src/global.routes';
import * as _ from 'lodash-es';
import { Location } from '@angular/common';
import { AlertController, ModalController, Platform } from '@ionic/angular';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { CREATE_SESSION_FORM, MANAGERS_CREATE_SESSION_FORM, PLATFORMS } from 'src/app/core/constants/formConstant';
import { FormService } from 'src/app/core/services/form/form.service';
import { map } from 'rxjs/operators';
import { Validators } from '@angular/forms';
import { manageSessionAction, permissions } from 'src/app/core/constants/permissionsConstant';
import { PermissionService } from 'src/app/core/services/permission/permission.service';
import { SearchPopoverComponent } from 'src/app/shared/components/search-popover/search-popover.component';
import { SearchCompetencyComponent } from 'src/app/shared/components/search-competency/search-competency.component';

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
  params: any;
  editSessionDisable: boolean;
  isMobile = window.innerWidth <= 950;

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
    private router: Router,
    private route:ActivatedRoute,
    private modalCtrl:ModalController,
    private permissionService:PermissionService
  ) {
  }
  async ngOnInit() {
    let formConfig =(await this.permissionService.hasPermission({ module: permissions.MANAGE_SESSION, action: manageSessionAction.SESSION_ACTIONS })) ? MANAGERS_CREATE_SESSION_FORM : CREATE_SESSION_FORM
    const platformForm = await this.getPlatformFormDetails();
    const result = await this.form.getForm(formConfig);
    this.formData = _.get(result, 'data.fields');
    this.entityNames = await this.form.getEntityNames(this.formData)
    this.entityList = await this.form.getEntities(this.entityNames, 'SESSION')
    this.formData = await this.form.populateEntity(this.formData,this.entityList)
    this.changeDetRef.detectChanges();
    this.permissionService.getPlatformConfig();
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
    this.isSubmited = true; //to be removed
    this.profileImageData.isUploaded = true;
    this.changeDetRef.detectChanges();
  }
  async getSessionDetailsUpdate(){
    let data = await this.sessionService.getSessionDetailsAPI(this.id);
    let response = data.result
        this.sessionDetails= response;
        this.profileImageData.image = response.image;
        this.profileImageData.isUploaded = true;
        response.start_date = moment.unix(response.start_date);
        response.end_date = moment.unix(response.end_date);
        this.preFillData(response);
        this.editSessionDisable = (this.sessionDetails?.status?.value=='LIVE')
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
        const form = Object.assign({}, {...this.form1.myForm.getRawValue(), ...this.form1.myForm.value});
        form.start_date = form.start_date.unix().toString();
        form.end_date = form.end_date.unix().toString();
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        form.time_zone = timezone;
        _.forEach(this.entityNames, (entityKey) => {
          let control = this.formData.controls.find(obj => obj.name === entityKey);
          form[entityKey] = control.multiple && control.type == 'chip' ? _.map(form[entityKey], 'value') : form[entityKey]
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
        if(obj && existingData?.meeting_info?.link){
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
      if (this.formData.controls[i].type=='search'){
        this.formData.controls[i].id = this.id;
        if(this.formData.controls[i].meta.multiSelect){
          this.formData.controls[i].meta.searchData = existingData[this.formData.controls[i].name]
          this.formData.controls[i].value = this.formData.controls[i].meta.searchData.map(obj => obj.id || obj.value);
        } else {
          this.formData.controls[i].meta.searchData = [{
            label: `${existingData.mentor_name}, ${existingData.organization.name}`,
            id: existingData[this.formData.controls[i].name]
          }];
        }
        if(!this.formData.controls[i].meta.disableIfSelected) {
          this.formData.controls[i].disabled = false;
        }
        if(this.formData.controls[i].meta.disableIfSelected&&this.formData.controls[i].value){
          this.formData.controls[i].disabled = true;
        }
      }
      let dependedChildIndex = this.formData.controls.findIndex(formControl => formControl.name === this.formData.controls[i].dependedChild)
      if(this.formData.controls[i].dependedChild && this.formData.controls[i].name === 'type'){
        if(existingData[this.formData.controls[i].name].value){
          this.formData.controls[i].disabled = true;
          this.formData.controls[dependedChildIndex].validators['required']= existingData[this.formData.controls[i].name].value=='PUBLIC' ? false : true
        }
      }
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

  formValueChanged(event){
    let dependedControlIndex = this.formData.controls.findIndex(formControl => formControl.name === event.dependedChild)
    let dependedControl = this.form1.myForm.get(event.dependedChild)
    if(event.value === "PUBLIC") {
      this.setControlValidity(dependedControlIndex, dependedControl, false);
    } else {
      this.setControlValidity(dependedControlIndex, dependedControl, true);
    }
    this.formData.controls.forEach(control => {
      if (event.meta.disabledChildren.includes(control.name)) {
        control.disabled = false;
      }
    })
  }
  
  setControlValidity(index, control, required) {
    this.formData.controls[index].validators['required'] = required;
    this.formData.controls[index].disabled = false;
    control.setValidators(required ? [Validators.required] : null);
    control.updateValueAndValidity();
  }

  eventHandler(event) {
    switch(event.type) {
      case 'addUser':
        this.showAddUserPopup(event)
        break;
      
      case 'addCompetency':
        this.showCompetencyPopup(event)
        break;
      
      case 'addUser view':
        this.viewSelectedUsers(event)
        break;

      case 'addCompetency view':
        this.viewSelectedCompetencies(event)
        break;
    }
  }

  async showCompetencyPopup(event) {
    const popover = await this.modalCtrl.create({
      component: SearchCompetencyComponent,
      cssClass: 'small-width-popover-config',
      backdropDismiss: false,
      componentProps: {
        data: {
          selectedData: event.formControl.selectedData,
          control: event.formControl.control,
          showFilter: false,
          showSearch: true,
          viewListMode: false,
          isMobile: this.isMobile
        }
      }
    });

    popover.onDidDismiss().then((data) => {
      if (data.data) {
        event.formControl.selectedData = data.data;
        const values = event.formControl.control.meta.multiSelect ? data.data.map(obj => obj.value) : data.data[0].value;
        console.log(values, event.formControl)
        event.formControl.onChange(values);
        event.formControl.icon = event.formControl.selectedData.length ? event.formControl.closeIconLight : event.formControl.addIconDark
      }
    });
    await popover.present();
  }

  async showAddUserPopup(event) {
    const popover = await this.modalCtrl.create({
      component: SearchPopoverComponent,
      cssClass: 'large-width-popover-config',
      backdropDismiss: false,
      componentProps: {
        data: {
          selectedData: event.formControl.selectedData,
          control: event.formControl.control,
          showFilter: true,
          showSearch: true,
          viewListMode: false,
          isMobile: this.isMobile
        }
      }
    });

    popover.onDidDismiss().then((data) => {
      if (data.data) {
        event.formControl.selectedData = data.data;
        const values = event.formControl.control.meta.multiSelect ? data.data.map(obj => obj.id) : data.data[0].id;
        event.formControl.onChange(values);
        event.formControl.icon = event.formControl.selectedData.length ? event.formControl.closeIconLight : event.formControl.addIconDark
      }
    });
    await popover.present();
  }

  async viewSelectedUsers(event) {
    const popover = await this.modalCtrl.create({
      component: SearchPopoverComponent,
      cssClass: 'large-width-popover-config',
      backdropDismiss: false,
      componentProps: {
        data: {
          selectedData: event.formControl.selectedData,
          control: event.formControl.control,
          showFilter: false,
          showSearch: false,
          viewListMode: true,
          isMobile: this.isMobile
        }
      }
    });

    popover.onDidDismiss().then((data) => {
      if (data.data) {
        event.formControl.selectedData = data.data
        const values = event.formControl.selectedData.length
        ? (event.formControl.control.meta.multiSelect ? event.formControl.selectedData.map(obj => obj.id) : event.formControl.selectedData[0].id)
        : (event.formControl.control.meta.multiSelect ? [] : '');
        event.formControl.onChange(values);
        event.formControl.icon = event.formControl.selectedData.length ? event.formControl.closeIconLight : event.formControl.addIconDark
      }
    });
    await popover.present();
  }

  async viewSelectedCompetencies(event) {
    const popover = await this.modalCtrl.create({
      component: SearchCompetencyComponent,
      cssClass: 'small-width-popover-config',
      backdropDismiss: false,
      componentProps: {
        data: {
          selectedData: event.formControl.selectedData,
          control: event.formControl.control,
          showFilter: false,
          showSearch: false,
          viewListMode: true,
          isMobile: this.isMobile
        }
      }
    });

    popover.onDidDismiss().then((data) => {
      if (data.data) {
        event.formControl.selectedData = data.data
        const values = event.formControl.selectedData.length
        ? (event.formControl.control.meta.multiSelect ? event.formControl.selectedData.map(obj => obj.value) : event.formControl.selectedData[0].value)
        : (event.formControl.control.meta.multiSelect ? [] : '');
        event.formControl.onChange(values);
        event.formControl.icon = event.formControl.selectedData.length ? event.formControl.closeIconLight : event.formControl.addIconDark
      }
    });
    await popover.present();
  }
}