import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
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
} from 'src/app/core/services';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { AlertController, Platform } from '@ionic/angular';
import { File } from '@ionic-native/file/ngx';
import { isDeactivatable } from 'src/app/core/guards/canDeactive/deactive.guard';
import { TranslateService } from '@ngx-translate/core';

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
    // menu: true,
    backButton: {
      label: 'PROFILE_DETAILS',
    },
    notification: false,
  };
  path;
  localImage;
  public formData: JsonFormData;
  showForm: any= false;
  userDetails: any;
  constructor(
    private form: FormService,
    private api: HttpService,
    private profileService: ProfileService,
    private localStorage: LocalStorageService,
    private attachment: AttachmentService,
    private platform: Platform,
    private file: File,
    private loaderService: LoaderService,
    private alert: AlertController,
    private translate: TranslateService,
    private toast: ToastService
  ) {
    this.path = this.platform.is('ios')
      ? this.file.documentsDirectory
      : this.file.externalDataDirectory;
  }
  async ngOnInit() {
    const response = await this.form.getForm(EDIT_PROFILE_FORM);
    this.profileImageData.isUploaded = true;
    this.formData = _.get(response, 'result.data.fields');
    this.userDetails =  await this.localStorage.getLocalData(localKeys.USER_DETAILS);
    this.profileImageData.image = this.userDetails.image;
    this.preFillData(this.userDetails);
  }

  async canPageLeave() {
    if (!this.form1.myForm.pristine || !this.profileImageData.isUploaded) {
      let texts: any;
      this.translate
        .get(['FORM_UNSAVED_DATA', 'CANCEL', 'OK', 'EXIT_HEADER_LABEL'])
        .subscribe((text) => {
          texts = text;
        });
      const alert = await this.alert.create({
        header: texts['EXIT_HEADER_LABEL'],
        message: texts['FORM_UNSAVED_DATA'],
        buttons: [
          {
            text: texts['CANCEL'],
            cssClass: 'alert-button-bg-white',
            role: 'exit',
            handler: () => {},
          },
          {
            text: texts['OK'],
            role: 'cancel',
            cssClass: 'alert-button-red',
            handler: () => {},
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

  onSubmit() {
    this.form1.onSubmit();
    if (this.form1.myForm.valid) {
      if (this.profileImageData.image && !this.profileImageData.isUploaded) {
        this.getImageUploadUrl(this.localImage);
      } else {
        this.form1.myForm.markAsPristine();
        this.profileService.profileUpdate(this.form1.myForm.value);
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
  imageUploadEvent(event) {
    this.localImage = event;
    this.profileImageData.image = this.win.Ionic.WebView.convertFileSrc(
      this.path + event.name
    );
    this.profileImageData.isUploaded = false;
  }
  upload(data) {
    this.loaderService.startLoader();
    this.attachment.cloudImageUpload(data).then(
      (resp) => {
        this.profileImageData.image = data.uploadUrl.destFilePath;
        this.form1.myForm.value.image = data.uploadUrl.destFilePath;
        this.profileImageData.isUploaded = true;
        this.loaderService.stopLoader();
        this.onSubmit();
      },
      (error) => {
        this.loaderService.stopLoader();
      }
    );
  }
  async getImageUploadUrl(file) {
    this.loaderService.startLoader();
    let config = {
      url: urlConstants.API_URLS.GET_IMAGE_UPLOAD_URL + file.name + "&dynamicPath=users/" + this.userDetails._id
    }
    let data: any = await this.api.get(config);
    this.loaderService.stopLoader();
    file.uploadUrl = data.result;
    this.upload(file);
  }
  preFillData(existingData) {
    for (let i = 0; i < this.formData.controls.length; i++) {
      this.formData.controls[i].value =
        existingData[this.formData.controls[i].name];
      this.formData.controls[i].options = _.unionBy(
        this.formData.controls[i].options,
        this.formData.controls[i].value,
        'value'
      );
    }
    this.showForm = true;
  }
}
