import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, NavParams } from '@ionic/angular';
import * as _ from 'lodash-es';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { LocalStorageService, ToastService } from 'src/app/core/services';
import { SessionService } from 'src/app/core/services/session/session.service';
import { DynamicFormComponent, JsonFormData } from 'src/app/shared/components/dynamic-form/dynamic-form.component';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.page.html',
  styleUrls: ['./feedback.page.scss'],
})
export class FeedbackPage implements OnInit {
  @ViewChild('form1') form1: DynamicFormComponent;

  formData: JsonFormData = {
    controls: [],
  };
  feedbackData = {
    feedbacks: [],
    feedbackAs: null
  };
  sessionData: any;
  isMentor: boolean;
  constructor(private sessionService: SessionService,
    private toast: ToastService,
    private router: Router,
    private modalController: ModalController,
    private navParams: NavParams,
    private localStorage: LocalStorageService) {
    this.sessionData = this.navParams?.data?.data;
  }

  ngOnInit() {
    this.isMentorChecking();
  }
  async isMentorChecking() {
    let userDetails = await this.localStorage.getLocalData(localKeys.USER_DETAILS);
    var response = await this.sessionService.getSessionDetailsAPI(this.sessionData._id);
    this.isMentor = userDetails?._id == response?.userId ? true : false;
    this.formData.controls = this.sessionData.form;
    this.feedbackData.feedbackAs = this.isMentor ? "mentor" : "mentee";
  }

  async submit() {
    this.form1.onSubmit();
    let feedbackKey = Object.keys(this.form1.myForm.value);
    feedbackKey.forEach((key) => {
      if (this.form1.myForm.value[key] != "") {
        let data;
        this.formData.controls.some((element) => {
          if (element.name === key) {
            data = element;
            return element;
          }
        });
        let feedback = { questionId: data._id, value: this.form1.myForm.value[key], label: data.label };
        this.feedbackData.feedbacks.push(feedback);
      }
    })
    let result = this.feedbackData.feedbacks.length ? await this.sessionService.submitFeedback(this.feedbackData, this.sessionData._id) : await this.sessionService.submitFeedback({ skippedFeedback: true, feedbackAs: this.feedbackData.feedbackAs }, this.sessionData._id);
    if (result) {
      this.toast.showToast(result?.message, "success");
    }
    await this.modalController.dismiss();
  }

  async closeModal() {
    await this.sessionService.submitFeedback({ skippedFeedback: true, feedbackAs: this.feedbackData.feedbackAs }, this.sessionData._id);
    await this.modalController.dismiss();
  }
}
