import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { LocalStorageService, ToastService } from 'src/app/core/services';
import { SessionService } from 'src/app/core/services/session/session.service';
import { CommonRoutes } from 'src/global.routes';
import { IonModal } from '@ionic/angular';
import { App, AppState } from '@capacitor/app';

@Component({
  selector: 'app-session-card',
  templateUrl: './session-card.component.html',
  styleUrls: ['./session-card.component.scss'],
})
export class SessionCardComponent implements OnInit {
  @Input() data: any;
  @Output() onClickEvent = new EventEmitter();
  @ViewChild(IonModal) modal: IonModal;
  startDate: string;
  isCreator: boolean;
  buttonConfig;
  userData: any;
  endDate: string;
  isModalOpen = false;
  meetingPlatform: any;
  
  constructor(private router: Router, private sessionService: SessionService, private toast: ToastService, private localStorage: LocalStorageService) { }
  
  async ngOnInit() {
    App.addListener('appStateChange', (state: AppState) => {
      if (state.isActive == true) {
        this.setButtonConfig(this.isCreator);
      }
    });
    this.meetingPlatform = (this.data?.meetingInfo);
    this.isCreator = await this.checkIfCreator();
    this.setButtonConfig(this.isCreator);
    this.startDate = (this.data.startDate>0)?moment.unix(this.data.startDate).toLocaleString():this.startDate;
    this.endDate = (this.data.endDate>0)?moment.unix(this.data.endDate).toLocaleString():this.endDate;
  }
 
  setButtonConfig(isCreator: boolean) {
    let currentTimeInSeconds=Math.floor(Date.now()/1000);
    if(isCreator){
      this.buttonConfig={label:"START",type:"startAction"};
    } else {
      this.buttonConfig=(!isCreator&&this.data.isEnrolled || !isCreator&&this.data.sessionId)?{label:"JOIN",type:"joinAction"}:{label:"ENROLL",type:"enrollAction"};
    }
    this.buttonConfig.isEnabled = ((this.data.startDate - currentTimeInSeconds) < 600 && !(this.data?.meetingInfo?.platform == 'OFF')) ? true : false
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
    };
    this.onClickEvent.emit(value)
  }
  clickOnAddMeetingLink(cardData:any){
    let id = cardData._id;
    this.router.navigate([CommonRoutes.CREATE_SESSION], { queryParams: { id: id , type: 'segment'} });
  }
}
