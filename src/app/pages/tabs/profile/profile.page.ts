import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonContent, NavController } from '@ionic/angular';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { CommonRoutes } from 'src/global.routes';
import * as _ from 'lodash-es';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService, UtilService } from 'src/app/core/services';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { Router } from '@angular/router';
import { FormService } from 'src/app/core/services/form/form.service';
import { EDIT_PROFILE_FORM } from 'src/app/core/constants/formConstant';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.page.html',
    styleUrls: ['./profile.page.scss'],
    standalone: false
})
export class ProfilePage implements OnInit {
  @ViewChild(IonContent) content: IonContent;
  formData: any = {
    controls: [
      { title: 'Sessions attended',
        key: 'sessions_attended',
      },
      {
        title: 'About',
        key: 'about',
      },
      {
        title: "Organization",
        key: "organizationName"
      },
      {
        title: 'Years of experience',
        key: 'experience',
      },
      {
        title: "Education qualification",
        key: "education_qualification"
      },
      {
        title: "Email id",
        key: "emailId"
      },
      {
        title: "Professional role",
        key: "professional_role"
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
  showProfileDetails: boolean = false;
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
  constructor(public navCtrl: NavController, private profileService: ProfileService, private translate: TranslateService, private router: Router, private localStorage:LocalStorageService, private utilService: UtilService, private form: FormService) { }

  ngOnInit() {
    this.visited = false;
  }
  async ionViewWillEnter() {
    this.user = await this.localStorage.getLocalData(localKeys.USER_DETAILS)
    let roles = await this.localStorage.getLocalData(localKeys.USER_ROLES);
    this.isMentor = roles.includes('mentor')?true:false;
    if(this.user){
      await this.profileService.getUserRole(this.user)
    }
    if(!this.isMentor&&!await this.localStorage.getLocalData(localKeys.IS_ROLE_REQUESTED)&&!this.isMentorButtonPushed) {
      this.buttonConfig.buttons.push(this.becomeAMentorButton)
      this.isMentorButtonPushed = true;
    }
    this.formData.data = this.user;
    this.formData.data.emailId = this.user?.email;
    this.formData.data.organizationName = this.user?.organization?.name;
    if (!this.formData?.data?.about) {
      (!this.visited && !this.formData.data.deleted)?this.router.navigate([CommonRoutes.EDIT_PROFILE],{replaceUrl:true}):null;
      this.visited=true;
    }
    this.showProfileDetails = true;
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
    const response = await this.form.getForm(EDIT_PROFILE_FORM);
    var result = await this.profileService.getProfileDetailsFromAPI();
    response.data.fields.controls.forEach(entity => {
      Object.entries(result).forEach(([key, value]) => {
        if(entity.type=='chip' &&  entity.name == key && !this.formData.controls.some(obj => obj.key === entity.name)){
          this.formData.controls.push(
            {
              title: entity.label,
              key: entity.name
            }
        )
      }
      });
    });
  let extraDataForm = [
    {
      title: "State",
      key: "state"
    },
    {
      title: "District",
      key: "district"
    },
    {
      title: "Block",
      key: "block"
    },
    {
      title: "Cluster",
      key: "cluster"
    },
    {
      title: "School",
      key: "school"
    }
  ];
  extraDataForm.forEach(field => {
    if (!this.formData.controls.some(existingField => existingField.key === field.key)) {
      this.formData.controls.push(field);
    }
  });
    if(result){
      this.formData.data = result;
      this.formData.data.emailId = result?.email;
      this.formData.data.organizationName = this.user.organization?.name;
    }
  }

  async upDateProfilePopup(msg:any = {header: 'UPDATE_PROFILE',message: 'PLEASE_UPDATE_YOUR_PROFILE_IN_ORDER_TO_PROCEED',cancel:'UPDATE',submit:'CANCEL'}){
    this.utilService.alertPopup(msg).then(async (data) => {
      if(!data){
        this.router.navigate([`/${CommonRoutes.EDIT_PROFILE}`], {replaceUrl:true});
      }
    }).catch(error => {})
  }
}
