import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { LoaderService, LocalStorageService, ToastService } from 'src/app/core/services';
import { SessionService } from 'src/app/core/services/session/session.service';
import { CommonRoutes } from 'src/global.routes';

@Component({
  selector: 'app-session-card',
  templateUrl: './session-card.component.html',
  styleUrls: ['./session-card.component.scss'],
})
export class SessionCardComponent implements OnInit {
  @Input() data: any;
  @Input() action;
  @Input() status:any;
  @Output() onClickEvent = new EventEmitter();
  constructor(private router: Router,private sessionService: SessionService, private toast:ToastService, private localStorage: LocalStorageService) { }
  ngOnInit() { }
  onCardClick(data) {
    let value = {
      data: data,
      type: 'cardSelect',
    }
    this.onClickEvent.emit(value)
  }
  async onEnroll(data){
    let userDetails = await this.localStorage.getLocalData(localKeys.USER_DETAILS);
    if (userDetails?.about) {
      let result = await this.sessionService.enrollSession(data._id);
      if(result?.result){
        this.toast.showToast("You have enrolled successfully","success");
      }
    } else {
      this.router.navigate([`/${CommonRoutes.TABS}/${CommonRoutes.PROFILE}`]);
    }
  }
}
