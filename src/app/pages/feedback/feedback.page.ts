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
  };
  id;
  isMentor: boolean;
  questionCount;
  constructor(private sessionService: SessionService,
    private toast: ToastService,
    private router: Router,
    private modalController: ModalController,
    private navParams: NavParams,
    private localStorage: LocalStorageService) {
    let sessionData = this.navParams?.data?.data;
    this.id = sessionData._id;
  }

  ngOnInit() {
    this.fetchFeedbackForm();
  }

  async fetchFeedbackForm() {
    let userDetails = await this.localStorage.getLocalData(localKeys.USER_DETAILS);
    var response = await this.sessionService.getSessionDetailsAPI(this.id);
    this.isMentor = userDetails._id == response.userId ? true : false;
    let questionSet = await this.sessionService.getFeedbackQuestionSet(this.isMentor);
    this.questionCount = questionSet?.questions.length;
    this.formData.controls = this.getQuestions(questionSet);
  }
  
  getQuestions(questionSet: any) {
    let controls=[];
    questionSet?.questions.forEach(async element => {
      let result = await this.sessionService.feedbackQuestion(element);
      controls.push({
        name: result?._id,
        label: "",
        heading: result?.question[0],
        value: "",
        numberOfStars: result?.noOfstars,
        type: "starRating",
        class: "ion-margin",
        position: "floating",
        validators: {
          required: false
        }
      })
    })
    return controls;
  }

  async submit() {
    this.form1.onSubmit();
    let feedbackId = Object.keys(this.form1.myForm.value);
    feedbackId.forEach((key, index) => {
      if (this.form1.myForm.value[key] != "") {
        this.feedbackData.feedbacks.push(this.form1.myForm.value[key]);
      }
    });
    let skippedFeedback=true;
    let result = this.feedbackData.feedbacks.length ? await this.sessionService.submitFeedback(this.feedbackData, this.id):await this.sessionService.submitFeedback({skippedFeedback: skippedFeedback}, this.id);
    if (result) {
      this.toast.showToast(result?.message, "success");
    }
    this.closeModal();
  }

  async closeModal() {
    await this.modalController.dismiss();
  }
}
