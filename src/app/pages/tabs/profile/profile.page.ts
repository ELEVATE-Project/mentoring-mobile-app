import { Component, Input, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { CommonRoutes } from 'src/global.routes';
import * as _ from 'lodash-es';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from 'src/app/core/services';
import { localKeys } from 'src/app/core/constants/localStorage.keys';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  formData: any = {
    form: [
      { title: 'SESSIONS_ATTENDED',
        key: 'sessionsAttended',
      },
      {
        title: 'ABOUT',
        key: 'about',
      },
      {
        title: 'DESIGNATION',
        key: 'designation',
      },
      {
        title: 'YEAR_OF_EXPERIENCE',
        key: 'experience',
      },
      {
        title: "KEY_AREAS_OF_EXPERTISE",
        key: "areasOfExpertise"
      },
      {
        title: "EDUCATION_QUALIFICATION",
        key: "educationQualification"
      },
      {
        title: "EMAIL_ID",
        key: "emailId"
      },
    ],
    menteeForm:['SESSIONS_ATTENDED'],
    data: {},
  };
  public buttonConfig = {
    label: "EDIT_PROFILE",
    action: "edit"
    
  }
  showProfileDetails: boolean = false;
  username: boolean = true;
  data: any;
  public headerConfig: any = {
    menu: true,
    notification: true,
    headerColor: 'primary',
    label:'PROFILE'
  };
  sessionData={}
  constructor(public navCtrl: NavController, private profileService: ProfileService, private translate: TranslateService, private localStorage: LocalStorageService) { }

  ngOnInit() {
  }
  ionViewWillEnter() {
    this.fetchProfileDetails();
  }

  async fetchProfileDetails() {
    var response = await this.profileService.profileDetails();
    this.formData.data = response;
    if (this.formData?.data?.about) {
      // TODO: remove the below line later
      this.showProfileDetails = true;
    }
  }

  async doRefresh(event){
    var result = await this.profileService.getProfileDetailsAPI();
    this.formData.data = result;
    event.target.complete();
  }

  feedback() {
    this.navCtrl.navigateForward([CommonRoutes.FEEDBACK]);
  }
}
