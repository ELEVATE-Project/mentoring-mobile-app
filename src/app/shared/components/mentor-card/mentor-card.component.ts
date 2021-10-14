import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-mentor-card',
  templateUrl: './mentor-card.component.html',
  styleUrls: ['./mentor-card.component.scss'],
})
export class MentorCardComponent implements OnInit {

  constructor() { }

  ngOnInit() {}

  onAction(id,action){
    // TODO method logic
  }
}
