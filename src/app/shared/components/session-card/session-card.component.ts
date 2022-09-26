import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { LocalStorageService, ToastService } from 'src/app/core/services';
import { SessionService } from 'src/app/core/services/session/session.service';
import { CommonRoutes } from 'src/global.routes';

@Component({
  selector: 'app-session-card',
  templateUrl: './session-card.component.html',
  styleUrls: ['./session-card.component.scss'],
})
export class SessionCardComponent implements OnInit {
  @Input() data: any;
  @Output() onClickEvent = new EventEmitter();
  startDate: string;
  isCreator: boolean;
  buttonConfig;
  userData: any;
  endDate: string;
  
  constructor(private router: Router, private sessionService: SessionService, private toast: ToastService, private localStorage: LocalStorageService) { }
  
  async ngOnInit() {
    this.isCreator = await this.checkIfCreator();
    this.setButtonConfig(this.isCreator);
    this.startDate = (this.data.startDate>0)?moment.unix(this.data.startDate).toLocaleString():this.startDate;
    this.endDate = (this.data.endDate>0)?moment.unix(this.data.endDate).toLocaleString():this.endDate;
  }
 
  setButtonConfig(isCreator: boolean) {
    if(isCreator){
      this.buttonConfig={label:"START",type:"startAction"};
    } else {
      this.buttonConfig=(!isCreator&&this.data.isEnrolled || !isCreator&&this.data.sessionId)?{label:"JOIN",type:"joinAction"}:{label:"ENROLL",type:"enrollAction"};
    }
    let currentTimeInSeconds=Math.floor(Date.now()/1000);
    this.buttonConfig.isEnabled = (this.data.startDate-currentTimeInSeconds<300)?true:false;
  }

  async checkIfCreator() {
    this.userData = await this.localStorage.getLocalData(localKeys.USER_DETAILS)
    return (this.data.userId == this.userData._id) ?true : false;
  }
 
  onCardClick(data) {
    let value = {
      data: data,
      type: 'cardSelect',
    }
    this.onClickEvent.emit(value)
  }

  onButtonClick(data,type){
    let value = {
      data: data,
      type:type
    }
    this.userData.about?this.onClickEvent.emit(value):this.router.navigate([`/${CommonRoutes.EDIT_PROFILE}`]);
  }
}
