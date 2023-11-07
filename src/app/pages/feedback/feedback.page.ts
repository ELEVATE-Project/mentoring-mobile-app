import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, NavParams } from '@ionic/angular';
import * as _ from 'lodash-es';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { LocalStorageService, ToastService } from 'src/app/core/services';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
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
    feedback_as: null
  };
  sessionData: any;
  isMentor: boolean;
  mentorName: any;
  sessionTitle: any;
  constructor(private sessionService: SessionService,
    private toast: ToastService,
    private router: Router,
    private modalController: ModalController,
    private navParams: NavParams,
    private localStorage: LocalStorageService,
    private profileService: ProfileService) {
    this.sessionData = this.navParams?.data?.data;
  }

  ngOnInit() {
    this.isMentorChecking();
  }
  async isMentorChecking() {
    var response = await this.sessionService.getSessionDetailsAPI(this.sessionData.id);
    this.mentorName = response.mentor_name;
    this.sessionTitle = response.title;
    this.isMentor = this.profileService.isMentor;
    for (let i = 0; i < this.sessionData.form.length; i++) {
      this.sessionData.form[i].validators = this.sessionData.form[i].rendering_data.validators;
      this.sessionData.form[i].class = this.sessionData.form[i].rendering_data.class;
    }
    this.formData.controls = this.sessionData.form;
    this.feedbackData.feedback_as = this.isMentor ? "mentor" : "mentee";
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
        let feedback = { question_id: data.id, value: this.form1.myForm.value[key], label: data.label };
        this.feedbackData.feedbacks.push(feedback);
      }
    })
    let result = this.feedbackData.feedbacks.length ? await this.sessionService.submitFeedback(this.feedbackData, this.sessionData.id) : await this.sessionService.submitFeedback({ skippedFeedback: true, feedback_as: this.feedbackData.feedback_as }, this.sessionData.id);
    if (result) {
      this.toast.showToast(result?.message, "success");
    }
    await this.modalController.dismiss(false);
  }

  async closeModal() {
    await this.sessionService.submitFeedback({ skippedFeedback: true, feedback_as: this.feedbackData.feedback_as }, this.sessionData.id);
    await this.modalController.dismiss(false);
  }
}
