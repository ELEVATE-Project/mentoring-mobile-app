import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash-es';
import { ToastService } from 'src/app/core/services';
import { SessionService } from 'src/app/core/services/session/session.service';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.page.html',
  styleUrls: ['./feedback.page.scss'],
})
export class FeedbackPage implements OnInit {
  public headerConfig: any = {
    // menu: true,
    backButton: {
      label: '',
    },
    notification: false,
    headerColor: 'white',
  };
  formData=[];
  id;
  isMentor: string;
  constructor(private sessionService: SessionService, private activatedRoute: ActivatedRoute, private toast: ToastService, private router: Router) {
    this.activatedRoute.queryParamMap.subscribe(params => {
      this.id = params.get('id');
      this.isMentor = params.get('isMentor');
    });
  }

  ngOnInit() {
    this.fetchFeedbackForm();
  }

  async fetchFeedbackForm(){
    let questionSet = await this.sessionService.getFeedbackQuestionSet();
    questionSet?.questions.forEach(async element => {
      let result = await this.sessionService.feedbackQuestion(element);
      this.formData.push({label: result?.question[0], numberOfStars: result?.noOfstars, value: result?.value, id: result?._id});
    });
  }

  getRating(ev, data) {
    data.value = ev;
    if (!_.includes(this.formData, data)) {
      this.formData.push(data);
    }
  }

  async submit(){
    let feedbackData={ 
      feedbacks: this.formData,
    }
    let result = await this.sessionService.submitFeedback(feedbackData,this.id);
    if(result){
    this.toast.showToast(result?.message, "success");
    }
    this.router.navigate(["/"]);
  }
}
