import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-mentor-directory',
  templateUrl: './mentor-directory.page.html',
  styleUrls: ['./mentor-directory.page.scss'],
})
export class MentorDirectoryPage implements OnInit {
  public headerConfig: any = {
    // menu: true,
    backButton: {
      label: 'Mentors Directory',
    },
    notification: false,
  };

  mentors =
      [
        {
          directoryName: 'A',
          values: [
            {
              title: 'Mentor 1',
              subTitle: 'sub title',
              image: 'person-circle-outline'
            },
            {
              title: 'Mentor 2',
              subTitle: 'sub title',
              image: 'person-circle-outline'
            },
            {
              title: 'Mentor 3',
              subTitle: 'sub title',
              image: 'person-circle-outline'
            }]
        },
        {
          directoryName: 'B',
          values: [
            {
              title: 'Mentor 1',
              subTitle: 'sub title',
              image: 'person-circle-outline'
            },
            {
              title: 'Mentor 2',
              subTitle: 'sub title',
              image: 'person-circle-outline'
            },
            {
              title: 'Mentor 3',
              subTitle: 'sub title',
              image: 'person-circle-outline'
            }]
        }
      ]
  constructor() { }

  ngOnInit() {
  }

  eventAction(event) {
    console.log(event, "event");
  }
}
