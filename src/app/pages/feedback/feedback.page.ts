import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash-es';

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
  formData: any=[];
  constructor() {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.formData = [
      {
        label: 'How would you rate the host of the session?',
        value: 0,
      },
      {
        label: 'How would you rate the engagement of the session?',
        value: 0,
      },
      {
        label: 'How would you rate the Audio/Vedio quality?',
        value: 0,
      },
    ];
  }

  getRating(ev, data) {
    data.value = ev;
    if (!_.includes(this.formData, data)) {
      this.formData.push(data);
    }
  }

  submit(){
    console.log(this.formData);
  }

}
