import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { HttpService } from 'src/app/core/services/http/http.service';
import {
  DynamicFormComponent,
  JsonFormData,
} from 'src/app/shared/components/dynamic-form/dynamic-form.component';
import { FormService } from 'src/app/core/services/form/form.service';
import * as _ from 'lodash-es';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { EDIT_PROFILE_FORM } from 'src/app/core/constants/formConstant';
import {
  AttachmentService,
  LoaderService,
  LocalStorageService,
  ToastService,
  UtilService,
} from 'src/app/core/services';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { AlertController, Platform } from '@ionic/angular';
import { isDeactivatable } from 'src/app/core/guards/canDeactive/deactive.guard';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CommonRoutes } from 'src/global.routes';
import { PlatformLocation } from '@angular/common';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
})
export class EditProfilePage implements OnInit, isDeactivatable {
  private win: any = window;
  @ViewChild('form1') form1: DynamicFormComponent;
  profileImageData: any = {
    type: 'profile',
  };
  public headerConfig: any = {
    backButton: true,
    label: 'PROFILE_DETAILS',
    notification: false,
  };
  path;
  localImage;
  showForm: any = false;
  userDetails: any;
  entityNames: any;
  entityList: any;
  formData: any;
  constructor(
    private form: FormService,
    private api: HttpService,
    private profileService: ProfileService,
    private localStorage: LocalStorageService,
    private attachment: AttachmentService,
    private changeDetRef: ChangeDetectorRef,
    private loaderService: LoaderService,
    private alert: AlertController,
    private translate: TranslateService,
    private toast: ToastService,
    private utilService: UtilService,
    private router: Router,
    private platformLocation: PlatformLocation
  ) {
  }

  ionViewWillEnter() {
    if(this.userDetails?.profile_mandatory_fields?.length || !this.userDetails?.about){
      history.pushState(null, '', location.href);
      this.platformLocation.onPopState(()=>{
      history.pushState(null, '', location.href)
    })
    }
  }
  async ngOnInit() {
    this.userDetails = await this.localStorage.getLocalData(localKeys.USER_DETAILS);
    const response = await this.form.getForm(EDIT_PROFILE_FORM);
    this.profileImageData.isUploaded = true;
    this.formData = _.get(response, 'data.fields');
    const entityNames = await this.form.getEntityNames(this.formData);
    this.entityNames = await this.updateEntityArray(this.userDetails?.profile_mandatory_fields, entityNames);
    this.entityList = await this.form.getEntities(this.entityNames, 'PROFILE');
    this.formData = await this.form.populateEntity(this.formData, this.entityList)
    this.changeDetRef.detectChanges();
    if (this.userDetails) {
      this.profileImageData.image = this.userDetails.image;
      this.profileService.prefillData(this.userDetails, this.entityNames, this.formData);
      this.showForm = true;
    }
    if(this.userDetails?.profile_mandatory_fields?.length || !this.userDetails?.about){
    this.headerConfig.backButton = false;
    let msg = {
        header: 'SETUP_PROFILE',
        message: 'SETUP_PROFILE_MESSAGE',
        cancel: "CONTINUE"
        }
        this.utilService.profileUpdatePopup(msg)
    }else{
        this.headerConfig.backButton = true;
    }
  }

  async canPageLeave() {
    if (this.form1 && !this.form1.myForm.pristine || !this.profileImageData.isUploaded) {
      let texts: any;
      this.translate
        .get(['PROFILE_FORM_UNSAVED_DATA', 'DONOT_SAVE', 'SAVE', 'PROFILE_EXIT_HEADER_LABEL'])
        .subscribe((text) => {
          texts = text;
        });
      const alert = await this.alert.create({
        header: texts['PROFILE_EXIT_HEADER_LABEL'],
        message: texts['PROFILE_FORM_UNSAVED_DATA'],
        buttons: [
          {
            text: texts['DONOT_SAVE'],
            cssClass: 'alert-button-bg-white',
            role: 'exit',
            handler: () => { },
          },
          {
            text: texts['SAVE'],
            role: 'cancel',
            cssClass: 'alert-button-red',
            handler: () => { },
          },
        ],
      });
      await alert.present();
      let data = await alert.onDidDismiss();
      if (data.role == 'exit') {
        return true;
      }
      return false;
    } else {
      return true;
    }
  }

  async onSubmit() {
    this.form1.onSubmit();
    if (this.form1.myForm.valid) {
      if (this.profileImageData.image && !this.profileImageData.isUploaded) {
        this.getImageUploadUrl(this.localImage);
      } else {
        const form = Object.assign({}, this.form1.myForm.value);
        _.forEach(this.entityNames, (entityKey) => {
          let control = this.formData.controls.find(obj => obj.name === entityKey);
          form[entityKey] = control.multiple ? _.map(form[entityKey], 'value') : form[entityKey]
        });
        this.form1.myForm.markAsPristine();
        const updated = await this.profileService.profileUpdate(form);
        if(updated){ this.router.navigate([`${CommonRoutes.TABS}/${CommonRoutes.HOME}`], { replaceUrl: true })}
      }
    } else {
      this.toast.showToast('Please fill all the mandatory fields', 'danger');
    }
  }

  resetForm() {
    this.form1.reset();
  }
  removeCurrentPhoto(event) {
    this.form1.myForm.value.image = '';
    this.profileImageData.image = '';
    this.form1.myForm.markAsDirty();
    this.profileImageData.isUploaded = true;
  }
  async imageUploadEvent(event) {
    this.localImage = event.target.files[0];
    var reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]);
    reader.onload = (file: any) => {
      this.profileImageData.image = file.target.result
      this.profileImageData.isUploaded = false;
      this.profileImageData.haveValidationError = true;
    }
  }
  upload(data, uploadUrl) {
    return this.attachment.cloudImageUpload(data, uploadUrl).pipe(
      map((resp => {
        this.profileImageData.image = uploadUrl.destFilePath;
        this.form1.myForm.value.image = uploadUrl.destFilePath;
        this.profileImageData.isUploaded = true;
        this.onSubmit();
      })))
  }
  async getImageUploadUrl(file) {
    this.loaderService.startLoader();
    let config = {
      url: urlConstants.API_URLS.GET_FILE_UPLOAD_URL + file.name.replace(/[^A-Z0-9]+/ig, "_").toLowerCase()
    }
    let data: any = await this.api.get(config);
    return this.upload(file, data.result).subscribe()
  }

  updateEntityArray(arr1: string[], arr2: string[]) {
    arr1.forEach(value => {
      if (!arr2.includes(value)) {
        arr2.push(value);
      }
    });
    return arr2
  }
}
