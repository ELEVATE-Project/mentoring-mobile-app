import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { JsonFormData } from 'src/app/shared/components/dynamic-form/dynamic-form.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  public formData: JsonFormData;
  sessions =[{
    _id:1,
    title:'Topic, Mentor name',
    subTitle: 'Short description ipsum dolor sit amet, consectetur'
  },
  {
    _id:2,
    title:'Topic, Mentor name',
    subTitle: 'Short description ipsum dolor sit amet, consectetur'
  },{
    _id:3,
    title:'Topic, Mentor name',
    subTitle: 'Short description ipsum dolor sit amet, consectetur'
  },{
    _id:4,
    title:'Topic, Mentor name',
    subTitle: 'Short description ipsum dolor sit amet, consectetur'
  }
]
  constructor(private http: HttpClient) {}
  ngOnInit() {
  }

  enroll(event){
    console.log(event,"event enroll");
  }

  onCardSelect(event){
    console.log(event,"event onCardSelect");
  }
}
