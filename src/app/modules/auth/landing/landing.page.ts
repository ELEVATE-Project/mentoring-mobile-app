import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { CommonRoutes } from 'src/global.routes';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
})
export class LandingPage implements OnInit {
  labels=["CREATE_ACCOUNT_TO_CONNECT_SOLVE_&_SHARE"];

  constructor(
    private router: Router,
    private translateService: TranslateService,
    private menuCtrl: MenuController
  ) {
    this.menuCtrl.enable(false);
  }

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
  onLogin(){
    this.router.navigate([`${CommonRoutes.AUTH}/${CommonRoutes.LOGIN}`]);
  }
  onSignup(){
    this.router.navigate([`${CommonRoutes.AUTH}/${CommonRoutes.REGISTER}`])
  }

}
