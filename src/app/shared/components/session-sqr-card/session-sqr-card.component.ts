import { Component, OnInit,Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { CommonRoutes } from 'src/global.routes';

@Component({
  selector: 'app-session-sqr-card',
  templateUrl: './session-sqr-card.component.html',
  styleUrls: ['./session-sqr-card.component.scss'],
})
export class SessionSqrCardComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {}

}
