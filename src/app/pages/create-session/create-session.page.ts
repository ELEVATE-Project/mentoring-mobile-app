import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
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
import { Platform } from '@ionic/angular';
import { File } from "@ionic-native/file/ngx";
import { urlConstants } from 'src/app/core/constants/urlConstants';
import * as moment from 'moment';

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
      label: 'Create Session',
    },
    notification: false,
    headerColor: 'white',
  };
  profileImageData: any = {
    type: 'session'
  }
  public formData: JsonFormData;
  showForm: boolean = false;
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

  ) {
    this.activatedRoute.queryParamMap.subscribe(params => {
      this.id = params?.get('id');
      this.path = this.platform.is("ios") ? this.file.documentsDirectory : this.file.externalDataDirectory;
    });
  }
  async ngOnInit() {
    this.http
      .get('/assets/dummy/createSession-form.json')
      .subscribe((formData: JsonFormData) => {
        this.formData = formData;
      });
    if (this.id) {
      let response = await this.sessionService.getSessionDetailsAPI(this.id);
      this.profileImageData.image = response.image;
      this.profileImageData.isUploaded = true;
      response.startDate = moment.unix(response.startDate).toISOString();
      response.endDate = moment.unix(response.endDate).toISOString();
      this.preFillData(response);
    } else {
      this.showForm = true;
    }
  }

  async onSubmit() {
    this.form1.onSubmit();
    if (this.form1.myForm.valid) {
      if (this.profileImageData.image && !this.profileImageData.isUploaded) {
        this.getImageUploadUrl(this.localImage);
      } else {
        this.form1.myForm.markAsPristine();
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        this.form1.myForm.value.timeZone = timezone;
        let result = await this.sessionService.createSession(this.form1.myForm.value, this.id);
        if (result) {
          this.location.back()
        }
      }
    } else {
      this.toast.showToast("Invalid data","danger");
    }
  }

  async getImageUploadUrl(file) {
    this.loaderService.startLoader();
    let config = {
      url: urlConstants.API_URLS.GET_SESSION_IMAGE_UPLOAD_URL + file.name
    }
    let data: any = await this.api.get(config);
    this.loaderService.stopLoader();
    file.uploadUrl = data.result;
    this.upload(file);
  }

  upload(data) {
    this.loaderService.startLoader();
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
}
