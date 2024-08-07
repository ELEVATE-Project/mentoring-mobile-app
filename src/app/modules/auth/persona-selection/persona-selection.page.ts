import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
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
  labels=["CHOOSE_YOUR_ROLE"];

  constructor(private router: Router, private translateService: TranslateService) { }

  ngOnInit() {
    this.translateText();
  }

  async translateText() {
    this.translateService.setDefaultLang('en');
    this.translateService.get(this.labels).subscribe(translatedLabel => {
      let labelKeys = Object.keys(translatedLabel);
      labelKeys.forEach((key)=>{
        let index = this.labels.findIndex(
          (label) => label === key
        )
        this.labels[index]=translatedLabel[key];
      })
    })
  }

  onAction(event) {
    this.userType=event.name;
  }

  goToSignup(){
    this.router.navigate([`${CommonRoutes.AUTH}/${CommonRoutes.REGISTER}`], {queryParams:{ userType: this.userType }});
  }
}