import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-session-card',
  templateUrl: './session-card.component.html',
  styleUrls: ['./session-card.component.scss'],
})
export class SessionCardComponent implements OnInit {
  @Input() data: Array<Object>;
  @Input() showEnroll: boolean = false;
  @Output() onClickEvent = new EventEmitter();
  constructor() { }
  ngOnInit() { }
  onAction($event, type) {
    let event = {
      event: $event,
      type: type
    }
    console.log(event, "event");
    this.onClickEvent.emit(event);
  }
}
