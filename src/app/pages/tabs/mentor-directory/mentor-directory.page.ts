import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonRoutes } from 'src/global.routes';

@Component({
  selector: 'app-mentor-directory',
  templateUrl: './mentor-directory.page.html',
  styleUrls: ['./mentor-directory.page.scss'],
})
export class MentorDirectoryPage implements OnInit {
  public headerConfig: any = {
    menu: true,
    label: 'MENTORS_DIRECTORY',
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
            image: 'person-circle-outline',
            _id:1
          },
          {
            title: 'Mentor 2',
            subTitle: 'sub title',
            image: 'person-circle-outline',
            _id:1
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
            image: 'person-circle-outline',
            _id:4
          },
          {
            title: 'Mentor 2',
            subTitle: 'sub title',
            image: 'person-circle-outline',
            _id:3
          },
          {
            title: 'Mentor 3',
            subTitle: 'sub title',
            image: 'person-circle-outline',
            _id:2
          }]
      }
    ]
  constructor(
    private router: Router
  ) { }

  ngOnInit() {
  }

  eventAction(event) {
    console.log(event, "event");
    switch (event.type) {
      case 'cardSelect':
        this.router.navigate([CommonRoutes.MENTOR_DETAILS]);
        break;
    }
  }
}
