import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-session-card',
  templateUrl: './session-card.component.html',
  styleUrls: ['./session-card.component.scss'],
})
export class SessionCardComponent implements OnInit {
  @Input() data: Array<Object>;
  @Input() action;
  @Output() onClickEvent = new EventEmitter();
  constructor() { }
  ngOnInit() { }
  onAction(event, type) {
    let payload = {
      id: event,
      type: type
    }
    console.log(payload, "event");
    this.onClickEvent.emit(payload);
  }
}
