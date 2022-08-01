import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TERMS_AND_CONDITIONS_FORM } from 'src/app/core/constants/formConstant';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { FormService } from 'src/app/core/services/form/form.service';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import * as _ from 'lodash-es';
import { CommonRoutes } from 'src/global.routes';
import { LocalStorageService } from 'src/app/core/services';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { TranslateService } from '@ngx-translate/core';
import { ModalController, Platform } from '@ionic/angular';

@Component({
  selector: 'app-terms-and-conditions',
  templateUrl: './terms-and-conditions.page.html',
  styleUrls: ['./terms-and-conditions.page.scss'],
})
export class TermsAndConditionsPage implements OnInit {
  items: any;
  notChecked: boolean = true;
  id: any;
  labels = ["TERMS_OF_USE"]
  constructor(private router: Router, private profileService: ProfileService,
    private authService: AuthService, private form: FormService, private elementRef: ElementRef, private activatedRoute: ActivatedRoute,
    private localStorage: LocalStorageService, private translateService: TranslateService, private modalController: ModalController, private platform: Platform) {
    this.fetchForm();
  }

  ionViewWillEnter() {
    this.activatedRoute.queryParams.subscribe(params => {
      this.id = params.sessionId ? params.sessionId : this.id;
    });
  }

  async fetchForm() {
    const response = await this.form.getForm(TERMS_AND_CONDITIONS_FORM);
    this.items = _.get(response, 'result.data.fields');
  }

  ngOnInit() { 
    let lang = this.translateService.getDefaultLang();
    lang?this.translateService.setDefaultLang(lang):this.translateService.setDefaultLang("en");
    this.translateText();
  }

  async translateText() {
    this.translateService.get(this.labels).subscribe(translatedLabel => {
      let labelKeys = Object.keys(translatedLabel);
      labelKeys.forEach((key) => {
        let index = this.labels.findIndex(
          (label) => label === key
        )
        this.labels[index] = translatedLabel[key];
      })
    })
    console.log(this.labels)
  }

  // expandItem(item): void {
  //   if (item.expanded) {
  //     item.expanded = false;
  //   } else {
  //     this.items.map(listItem => {
  //       if (item == listItem) {
  //         listItem.expanded = !listItem.expanded;
  //       } else {
  //         listItem.expanded = false;
  //       }
  //       return listItem;
  //     });
  //   }
  // }

  async goToHome() {
    await this.authService.acceptTermsAndConditions();
    await this.setLocalStorage();
    await this.modalController.dismiss();
  }
  async setLocalStorage() {
    let localUser = await this.localStorage.getLocalData(localKeys.USER_DETAILS);
    await this.profileService.getProfileDetailsFromAPI(localUser.isAMentor,localUser._id);
  }

  checked() {
    this.notChecked = (this.notChecked == true) ? false : true;
  }
}
