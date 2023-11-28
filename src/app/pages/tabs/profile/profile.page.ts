import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonContent, NavController } from '@ionic/angular';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { CommonRoutes } from 'src/global.routes';
import * as _ from 'lodash-es';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from 'src/app/core/services';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  @ViewChild(IonContent) content: IonContent;
  formData: any = {
    form: [
      { title: 'SESSIONS_ATTENDED',
        key: 'sessions_attended',
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
        title: "ORGANIZATION",
        key: "organizationName"
      },
      {
        title: 'YEAR_OF_EXPERIENCE',
        key: 'experience',
      },
      {
        title: "KEY_AREAS_OF_EXPERTISE",
        key: "area_of_expertise"
      },
      {
        title: "EDUCATION_QUALIFICATION",
        key: "education_qualification"
      },
      {
        title: 'LANGUAGES',
        key: 'languages',
      },
      {
        title: "EMAIL_ID",
        key: "emailId"
      }
    ],
    menteeForm:['SESSIONS_ATTENDED'],
    data: {},
  };
  
public buttonConfig = {
  buttons: [
    {
      label: "EDIT_PROFILE",
      action: "edit"
    }
  ]
}
  showProfileDetails: boolean = true;
  username: boolean = true;
  data: any;
  public headerConfig: any = {
    menu: true,
    notification: true,
    headerColor: 'primary',
    label:'PROFILE'
  };
  becomeAMentorButton ={
    label: "BECOME_A_MENTOR",
    action: "role"
    
  }
  sessionData={}
  user: any;
  visited:boolean;
  isMentor: boolean;
  isMentorButtonPushed: boolean = false;
  constructor(public navCtrl: NavController, private profileService: ProfileService, private translate: TranslateService, private router: Router, private localStorage:LocalStorageService) { }

  ngOnInit() {
    this.visited = false;
  }
  async ionViewWillEnter() {
    this.user = await this.localStorage.getLocalData(localKeys.USER_DETAILS)
    if(this.user){
      await this.profileService.getUserRole(this.user)
    }
    if(!this.profileService.isMentor&&!await this.localStorage.getLocalData(localKeys.IS_ROLE_REQUESTED)&&!this.isMentorButtonPushed) {
      this.buttonConfig.buttons.push(this.becomeAMentorButton)
      this.isMentorButtonPushed = true;
    }
    this.formData.data = this.user;
    this.formData.data.emailId = this.user.email.address;
    this.formData.data.organizationName = this.user.organization.name;
    this.isMentor = this.profileService.isMentor;
    if (this.formData?.data?.about) {
      this.showProfileDetails = true;
    } else {
      (!this.visited && !this.formData.data.deleted)?this.router.navigate([CommonRoutes.EDIT_PROFILE]):null;
      this.visited=true;
    }
    this.gotToTop();
    this.profileDetailsApi();
  }

  gotToTop() {
    this.content.scrollToTop(1000);
  }


  async doRefresh(event){
    this.profileDetailsApi();
    event.target.complete();
  }

  feedback() {
    this.navCtrl.navigateForward([CommonRoutes.FEEDBACK]);
  }
  async profileDetailsApi(){
    var result = await this.profileService.getProfileDetailsFromAPI();
    if(result){
      this.formData.data = result;
      this.formData.data.emailId = result.email;
      this.formData.data.organizationName = this.user.organization.name;
    }
  }
}
