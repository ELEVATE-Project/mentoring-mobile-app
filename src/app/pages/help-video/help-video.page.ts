import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-help-video',
  templateUrl: './help-video.page.html',
  styleUrls: ['./help-video.page.scss'],
})
export class HelpVideoPage implements OnInit {

  public headerConfig: any = {
    backButton: true,
    label: "Help videos"
  };

  items = [
    { content : 'How to start creating sessions', 
      video : 'https://www.youtube.com/watch?v=hV3lR31quOI',
      href : 'https://i.picsum.photos/id/0/5616/3744.jpg?hmac=3GAAioiQziMGEtLbfrdbcoenXoWAW-zlyEAMkfEdBzQ'},
    { content : 'How to search for mentors',
      href : 'https://i.picsum.photos/id/0/5616/3744.jpg?hmac=3GAAioiQziMGEtLbfrdbcoenXoWAW-zlyEAMkfEdBzQ'},
    { content : 'How to enroll a session' ,
      href : 'https://i.picsum.photos/id/0/5616/3744.jpg?hmac=3GAAioiQziMGEtLbfrdbcoenXoWAW-zlyEAMkfEdBzQ'},
    { content : 'How to join the session' ,
      href : 'https://i.picsum.photos/id/0/5616/3744.jpg?hmac=3GAAioiQziMGEtLbfrdbcoenXoWAW-zlyEAMkfEdBzQ'},
    { content : 'How to enroll a session' ,
      href : 'https://i.picsum.photos/id/0/5616/3744.jpg?hmac=3GAAioiQziMGEtLbfrdbcoenXoWAW-zlyEAMkfEdBzQ'},
    { content : 'How to join the session' ,
      href : 'https://i.picsum.photos/id/0/5616/3744.jpg?hmac=3GAAioiQziMGEtLbfrdbcoenXoWAW-zlyEAMkfEdBzQ'},
  ]

  constructor(private router: Router) { }

  ngOnInit() {
  }

  goToHome() {
    this.router?.navigate([``]);
  }

}
