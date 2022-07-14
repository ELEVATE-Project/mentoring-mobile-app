import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-mentor-card',
  templateUrl: './mentor-card.component.html',
  styleUrls: ['./mentor-card.component.scss'],
})
export class MentorCardComponent implements OnInit {
@Input() data: any;
@Output() onClickEvent = new EventEmitter();

  constructor() { }

  ngOnInit() {}

  onCardClick(data) {
    let value = {
      data: data,
      type: 'cardSelect',
    }
    this.onClickEvent.emit(value)
  }

}
