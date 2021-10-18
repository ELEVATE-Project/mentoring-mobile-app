import { Component, OnInit,Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-session-sqr-card',
  templateUrl: './session-sqr-card.component.html',
  styleUrls: ['./session-sqr-card.component.scss'],
})
export class SessionSqrCardComponent implements OnInit {

  @Input() data;
  @Output() onClickEvent = new EventEmitter();
  constructor() { }

  ngOnInit() {}
  action(data,type){
    let event ={
      data : data,
      type:type
    }
    this.onClickEvent.emit(event);
  }
}
