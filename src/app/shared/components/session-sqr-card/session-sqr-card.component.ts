import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-session-sqr-card',
  templateUrl: './session-sqr-card.component.html',
  styleUrls: ['./session-sqr-card.component.scss'],
})
export class SessionSqrCardComponent implements OnInit {

  sessions =[{
    title :'Session Name 1',
    description:'Session Details',
    date:'20/11/2021'
  },
  {
    title :'Session Name 2',
    description:'Session Details',
    date:'20/11/2021'
  },{
    title :'Session Name 3',
    description:'Session Details',
    date:'20/11/2021'
  }]
  constructor() { }

  ngOnInit() {}

}
