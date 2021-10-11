import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-session-card',
  templateUrl: './session-card.component.html',
  styleUrls: ['./session-card.component.scss'],
})
export class SessionCardComponent implements OnInit {
@Input() sessions;
@Input() showEnroll : boolean = false;
@Output() onCardSelect = new EventEmitter();
@Output() onClickEnroll = new EventEmitter();

  constructor() { }

  ngOnInit() {}


  onClickCard($event){
    this.onCardSelect.emit($event);
  }

  onEnroll($event){
    this.onClickEnroll.emit($event);
  }
}
