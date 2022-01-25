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

@Component({
  selector: 'app-terms-and-conditions',
  templateUrl: './terms-and-conditions.page.html',
  styleUrls: ['./terms-and-conditions.page.scss'],
})
export class TermsAndConditionsPage implements OnInit {
  items: any;
  notChecked: boolean=true;
  public headerConfig: any = {
    menu: false,
    notification: false,
    backButton: true,
  };
  id: any;
  constructor(private router: Router, private profileService: ProfileService,
    private authService: AuthService, private form: FormService, private elementRef: ElementRef, private activatedRoute: ActivatedRoute, private localStorage: LocalStorageService) {
      this.fetchForm();
  }

  ionViewWillEnter() {
    this.activatedRoute.queryParams.subscribe(params => {
      this.id = params.sessionId ? params.sessionId : this.id;
      console.log(this.id);
    });
  }

  async fetchForm() {
    const response = await this.form.getForm(TERMS_AND_CONDITIONS_FORM);
    console.log(response);
    this.items = _.get(response, 'result.data.fields');  }

  ngOnInit() {}

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

  async goToHome(){
    if(this.id){
      await this.authService.acceptTermsAndConditions();
      await this.setLocalStorage();
      await this.router.navigate([`/${CommonRoutes.SESSIONS_DETAILS}/${this.id}`], { replaceUrl: true });
    } else {
      await this.authService.acceptTermsAndConditions();
      await this.setLocalStorage();
      this.router.navigate([`/${CommonRoutes.TABS}/${CommonRoutes.HOME}`], { replaceUrl: true });
    }
  }
  async setLocalStorage() {
    const userData = await this.profileService.getProfileDetailsAPI();
    console.log(userData);
    await this.localStorage.setLocalData(localKeys.USER_DETAILS, userData);
  }

  checked(){
    this.notChecked = (this.notChecked == true) ? false : true;
  }
}
