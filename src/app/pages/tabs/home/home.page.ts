import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { JsonFormData } from 'src/app/shared/components/dynamic-form/dynamic-form.component';
import { CommonRoutes } from 'src/global.routes';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  public formData: JsonFormData;
  Call_Sessions: string=CommonRoutes.Call_Sessions;
  sessions =[{
    _id:1,
    title:'Topic, Mentor name',
    subTitle: 'Short description ipsum dolor sit amet, consectetur',
    description:'Short description ipsum dolor sit amet, consectetur',
    date:'20/11/2021',
    status:'Live'
  },
  {
    _id:2,
    title:'Topic, Mentor name',
    subTitle: 'Short description ipsum dolor sit amet, consectetur',
    description:'Short description ipsum dolor sit amet, consectetur',
    date:'20/11/2021',
    status:'Live'
  },{
    _id:3,
    title:'Topic, Mentor name',
    subTitle: 'Short description ipsum dolor sit amet, consectetur',
    description:'Short description ipsum dolor sit amet, consectetur',
    date:'20/11/2021'
  },{
    _id:4,
    title:'Topic, Mentor name',
    subTitle: 'Short description ipsum dolor sit amet, consectetur',
    description:'Short description ipsum dolor sit amet, consectetur',
    date:'20/11/2021'
  }
]

public headerConfig: any = {
  menu: true,
  notification: true,
  headerColor: 'primary',
};
  constructor(private http: HttpClient) {}
  ngOnInit() {
  }
  eventAction(event){
    console.log(event,"event");
  }
}
