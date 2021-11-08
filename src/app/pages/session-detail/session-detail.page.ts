import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-session-detail',
  templateUrl: './session-detail.page.html',
  styleUrls: ['./session-detail.page.scss'],
})
export class SessionDetailPage implements OnInit {

  constructor() { }
  ngOnInit() {
  }
  public headerConfig: any = {
    headerColor: 'primary',
    backButton: true,
    label:"SESSIONS_DETAILS"
  };
  profileImageData: Object = {
    name: "Session Name",
    region: null,
    join_button: true,
    session_image: null,
  }
  detailData = {
    form: [
      {
        title: 'Session Details',
        key: 'sessionDetails',
      },
      {
        title: 'Audience',
        key: 'audience',
      },
      {
        title: 'Medium',
        key: 'medium',
      },
      {
        title: "Duration",
        key: "duration"
      },
      {
        title: "Date",
        key: "date"
      }
    ],
    data: {
      sessionDetails: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
      audience: [
        {
          "value": "Teachers",
          "label": "Teachers"
        },
        {
          "value": "Block Officers",
          "label": "Block Officers"
        },
      ],
      medium: [
        {
          "value": "English",
          "label": "English"
        },
        {
          "value": "Hindi",
          "label": "Hindi"
        },
      ],
      duration: "",
      date: "",
    },
  };
}
