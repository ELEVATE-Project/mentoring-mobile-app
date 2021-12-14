import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { ToastService } from 'src/app/core/services';
import { CommonRoutes } from 'src/global.routes';

@Component({
  selector: 'app-session-card-template',
  templateUrl: './session-card-template.component.html',
  styleUrls: ['./session-card-template.component.scss'],
})
export class SessionCardTemplateComponent implements OnInit {
  @Input() data: any;
  @Input() showEnroll;
  @Input() showStart:boolean;
  @Input() buttonConfig:any;
  @Output() onClickEvent = new EventEmitter();
  constructor(private router: Router, private toast:ToastService) { }

  ngOnInit() { 
    let startDate = moment.unix(this.data.startDate);
    this.data.startDate = startDate.toLocaleString();
  }


  onAction(data, type) {
    let value = {
      data: data,
      type: type,
    }
    this.onClickEvent.emit(value)
  }

  onCardClick(data){
    data.sessionId ? this.router.navigate([`/${CommonRoutes.SESSIONS_DETAILS}/${data.sessionId}`]) : this.router.navigate([`/${CommonRoutes.SESSIONS_DETAILS}/${data._id}`]);
  }
}
