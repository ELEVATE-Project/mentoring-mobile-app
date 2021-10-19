import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-session-card-template',
  templateUrl: './session-card-template.component.html',
  styleUrls: ['./session-card-template.component.scss'],
})
export class SessionCardTemplateComponent implements OnInit {
  @Input() data;
  @Output() onClickEvent = new EventEmitter();
  constructor() { }

  ngOnInit() { }

  onAction(data, type) {
    let value = {
      data: data,
      type: type
    }
    this.onClickEvent.emit(value)
  }
}
