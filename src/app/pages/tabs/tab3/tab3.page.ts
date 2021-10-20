import { Component } from '@angular/core';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  constructor() {}
  profileImageData: Object={
    name:"Username",
    region:"Karnataka",
    profile_image:null,
  }
  userDetails: Object={
    about:"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
    designation:"",
    yearOfExperience:"",
    keyAreasOfExpertise: ["Mathematics","Computer Science"],
    languages:["English", "Hindi", ]
  }
  public isArray(arr:any ) {
    return Array.isArray(arr)
 }
  public headerConfig: any = {
    menu: true,
    notification: true,
    headerColor: 'primary',
  };
}
