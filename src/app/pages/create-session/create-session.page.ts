import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
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
import { File } from "@ionic-native/file/ngx";
import { urlConstants } from 'src/app/core/constants/urlConstants';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { CREATE_SESSION_FORM } from 'src/app/core/constants/formConstant';
import { FormService } from 'src/app/core/services/form/form.service';

@Component({
  selector: 'app-create-session',
  templateUrl: './create-session.page.html',
  styleUrls: ['./create-session.page.scss'],
})
export class CreateSessionPage implements OnInit {
  private win: any = window;
  @ViewChild('form1') form1: DynamicFormComponent;
  id: any = null;
  localImage;
  path;
  public headerConfig: any = {
    // menu: true,
    backButton: {
      label: 'CREATE_SESSION',
    },
    notification: false,
  };
  profileImageData: any = {
    type: 'session'
  }
  public formData: JsonFormData;
  showForm: boolean = false;
  isSubmited: boolean;
  constructor(
    private http: HttpClient,
    private sessionService: SessionService,
    private toast: ToastService,
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private attachment: AttachmentService,
    private platform: Platform,
    private file: File,
    private api: HttpService,
    private loaderService: LoaderService,
    private translate: TranslateService,
    private alert: AlertController,
    private form: FormService,
    private changeDetRef: ChangeDetectorRef
  ) {
    this.activatedRoute.queryParamMap.subscribe(params => {
      this.id = params?.get('id');
      this.path = this.platform.is("ios") ? this.file.documentsDirectory : this.file.externalDataDirectory;
    });
  }
  async ngOnInit() {
    const result = await this.form.getForm(CREATE_SESSION_FORM);
    this.formData = _.get(result, 'result.data.fields');
    if (this.id) {
      let response = await this.sessionService.getSessionDetailsAPI(this.id);
      this.profileImageData.image = response.image;
      this.profileImageData.isUploaded = true;
      response.startDate = moment.unix(response.startDate).format("YYYY-MM-DDTHH:mm");
      response.endDate = moment.unix(response.endDate).format("YYYY-MM-DDTHH:mm");
      this.preFillData(response);
    } else {
      this.showForm = true;
    }
    this.isSubmited = false; //to be removed
    this.profileImageData.isUploaded = true;
    this.changeDetRef.detectChanges();
  }

  async canPageLeave() {
    if (!this.form1.myForm.pristine || !this.profileImageData.isUploaded) {
      let texts: any;
      this.translate.get(['SESSION_FORM_UNSAVED_DATA', 'EXIT', 'BACK']).subscribe(text => {
        texts = text;
      })
      const alert = await this.alert.create({
        message: texts['SESSION_FORM_UNSAVED_DATA'],
        buttons: [
          {
            text: texts['EXIT'],
            cssClass: "alert-button",
            handler: () => { }
          },
          {
            text: texts['BACK'],
            cssClass: "alert-button",
            role: 'cancel',
            handler: () => { }
          }
        ]
      });
      await alert.present();
      let data = await alert.onDidDismiss();
      if (data.role == 'cancel') {
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
    return true
  }


  async onSubmit() {
    if(!this.isSubmited){
      this.form1.onSubmit();
      this.isSubmited = true;
    }
    if (this.form1.myForm.valid) {
      if (this.profileImageData.image && !this.profileImageData.isUploaded) {
        this.getImageUploadUrl(this.localImage);
      } else {
        const form = Object.assign({}, this.form1.myForm.value);
        form.startDate = new Date(form.startDate).getTime() / 1000.0;
        form.endDate = new Date(form.endDate).getTime() / 1000.0;
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        form.timeZone = timezone;
        this.form1.myForm.markAsPristine();
        let result = await this.sessionService.createSession(form, this.id);
        if (result) {
          this.location.back()
        }
      }
    } else {
      this.toast.showToast("Please fill all the mandatory fields", "danger");
    }
  }

  async getImageUploadUrl(file) {
    this.loaderService.startLoader();
    let config = {
      url: urlConstants.API_URLS.GET_SESSION_IMAGE_UPLOAD_URL + file.name
    }
    let data: any = await this.api.get(config);
    file.uploadUrl = data.result;
    this.upload(file);
  }

  upload(data) {
    this.attachment.cloudImageUpload(data).then(resp => {
      this.profileImageData.image = data.uploadUrl.destFilePath;
      this.form1.myForm.value.image = [data.uploadUrl.destFilePath];
      this.profileImageData.isUploaded = true;
      this.loaderService.stopLoader();
      this.onSubmit();
    }, error => {
      this.loaderService.stopLoader();
    })
  }

  resetForm() {
    this.form1.reset();
  }

  preFillData(existingData) {
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

  imageUploadEvent(event) {
    this.localImage = event;
    this.profileImageData.image = this.win.Ionic.WebView.convertFileSrc(this.path + event.name);
    this.profileImageData.isUploaded = false;
  }

  imageRemoveEvent(event){
    this.profileImageData.image = '';
    this.form1.myForm.value.image ='';
    this.form1.myForm.markAsDirty();
    this.profileImageData.isUploaded = true;
  }
}
