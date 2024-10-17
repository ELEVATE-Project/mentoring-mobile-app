import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-generic-card',
  templateUrl: './generic-card.component.html',
  styleUrls: ['./generic-card.component.scss'],
})
export class GenericCardComponent implements OnInit {
  @Input() data: any;
  @Output() onClickEvent = new EventEmitter();

  constructor() { }
  isSessionButtonVisible: boolean = true;
  isSessionChatVisible: boolean= true;

  ngOnInit() { }

  onCardClick(data) {
    let value = {
      data: data,
      type: 'cardSelect',
    }
    this.onClickEvent.emit(value)
  }
  onChatButtonClick(){
    console.log('on chat click')
  }
  onReqSessionButtonClick(){
    console.log('on session button click')
  }
}
