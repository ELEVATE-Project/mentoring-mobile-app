import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { LocalStorageService } from 'src/app/core/services';

@Component({
  selector: 'app-generic-card',
  templateUrl: './generic-card.component.html',
  styleUrls: ['./generic-card.component.scss'],
})
export class GenericCardComponent implements OnInit {
  @Input() data: any;
  @Output() onClickEvent = new EventEmitter();
  // buttonConfig: { chatButton: boolean; requestSessionButton: boolean; };
  @Input() buttonConfig: any;

  constructor(private localStorage: LocalStorageService) { }

  async ngOnInit() { 
    let user = await this.localStorage.getLocalData(localKeys.USER_DETAILS);
    // this.buttonConfig = {
    //   chatButton: true,
    //   requestSessionButton: true
    // }
   }

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
