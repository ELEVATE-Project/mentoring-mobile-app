import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from 'src/app/core/services';
import { HttpService } from 'src/app/core/services/http/http.service';
import { SessionService } from 'src/app/core/services/session/session.service';
import {
  DynamicFormComponent,
  JsonFormData,
} from 'src/app/shared/components/dynamic-form/dynamic-form.component';
import { CommonRoutes } from 'src/global.routes';
import * as _ from 'lodash-es';
import { Location } from '@angular/common';

@Component({
  selector: 'app-create-session',
  templateUrl: './create-session.page.html',
  styleUrls: ['./create-session.page.scss'],
})
export class CreateSessionPage implements OnInit {
  @ViewChild('form1') form1: DynamicFormComponent;
  id: any=null;

  public headerConfig: any = {
    // menu: true,
    backButton: {
      label: 'Create Session',
    },
    notification: false,
    headerColor: 'white',
  };
  profileImageData: {};
  public formData: JsonFormData;
  showForm: boolean = false;
  constructor(
    private http: HttpClient,
    private sessionService: SessionService,
    private toast: ToastService,
    private activatedRoute: ActivatedRoute,
    private location: Location) {
    this.activatedRoute.queryParamMap.subscribe(params => {
      this.id = params?.get('id');
    });
  }
  async ngOnInit() {
    this.http
      .get('/assets/dummy/createSession-form.json')
      .subscribe((formData: JsonFormData) => {
        this.formData = formData;
      });
    if (this.id) {
      let result = await this.sessionService.getSessionDetailsAPI(this.id);
      this.preFillData(result);
    } else {
      this.showForm = true;
    }
  }

  async onSubmit() {
    this.form1.onSubmit();
    let result = await this.sessionService.createSession(this.form1.myForm.value, this.id);
    if (result) {
      this.location.back()
    }
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

  ionViewDidLeave(){
    this.id=null;
  }
}
