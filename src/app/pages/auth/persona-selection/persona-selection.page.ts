import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonRoutes } from 'src/global.routes';

@Component({
  selector: 'app-persona-selection',
  templateUrl: './persona-selection.page.html',
  styleUrls: ['./persona-selection.page.scss'],
})
export class PersonaSelectionPage implements OnInit {
  personaList = [{
    name: "mentor",
    value: "Mentor",
    isChecked: false
  },
  {
    name: "mentee",
    value: "Mentee",
    isChecked: false
  }];
  public headerConfig: any = {
    backButton: {
      label: '',
      color: 'primary'
    },
  };
  userType:any;

  constructor(private router: Router) { }

  ngOnInit() {
  }
  onAction(event) {
    this.userType=event.name;
  }

  goToSignup(){
    this.router.navigate([`${CommonRoutes.AUTH}/${CommonRoutes.REGISTER}`], {queryParams:{ userType: this.userType }});
  }
}