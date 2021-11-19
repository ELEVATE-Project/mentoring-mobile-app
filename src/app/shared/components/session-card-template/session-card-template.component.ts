import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-session-card-template',
  templateUrl: './session-card-template.component.html',
  styleUrls: ['./session-card-template.component.scss'],
})
export class SessionCardTemplateComponent implements OnInit {
  @Input() data: any;
  @Input() showEnroll;
  @Input() showStart:boolean;
  @Input() showEdit;
  @Input() status:any;
  @Output() onClickEvent = new EventEmitter();
  constructor() { }

  ngOnInit() { }

  onAction(data, type) {
    let showEditButton:boolean = this.status==1 ? true : false;
    let value = {
      data: data,
      type: type,
      showEditButton: showEditButton,
    }
    this.onClickEvent.emit(value)
  }
}
