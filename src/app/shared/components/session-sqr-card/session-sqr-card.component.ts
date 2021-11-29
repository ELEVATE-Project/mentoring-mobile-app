import { Component, OnInit,Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { CommonRoutes } from 'src/global.routes';

@Component({
  selector: 'app-session-sqr-card',
  templateUrl: './session-sqr-card.component.html',
  styleUrls: ['./session-sqr-card.component.scss'],
})
export class SessionSqrCardComponent implements OnInit {

  @Input() data;
  @Output() onClickEvent = new EventEmitter();
  constructor(private router: Router) { }

  ngOnInit() {}

  action(data,type){
    let event ={
      data : data,
      type:type
    }
    this.onClickEvent.emit(event);
  }

  onCardClick() {
    console.log(this.data)
    this.router.navigate([`/${CommonRoutes.SESSIONS_DETAILS}/${this.data?.sessionId || this.data?._id}`]);
  }
}
