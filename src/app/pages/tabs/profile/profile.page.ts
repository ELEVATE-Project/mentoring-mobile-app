import { Component, ViewChild, computed, signal } from '@angular/core';
import { IonContent, NavController } from '@ionic/angular';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { CommonRoutes } from 'src/global.routes';
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
export class ProfilePage {
  @ViewChild(IonContent) content!: IonContent;
  readonly formData = signal<any>({
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
  });

  readonly buttonConfig = signal<any>({
    buttons: [
      {
        label: 'EDIT_PROFILE',
        action: 'edit'
      }
    ]
  });

  readonly showProfileDetails = signal(false);
  readonly user = signal<any>(null);
  readonly visited = signal(false);
  readonly isMentor = signal(false);
  readonly isMentorButtonPushed = signal(false);

  readonly profileData = computed(() => this.formData()?.data || {});

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
  constructor(public navCtrl: NavController, private profileService: ProfileService, private router: Router, private localStorage:LocalStorageService, private utilService: UtilService, private form: FormService) { }

  ngOnInit() {
    this.visited.set(false);
  }
  async ionViewWillEnter() {
    const user = await this.localStorage.getLocalData(localKeys.USER_DETAILS);
    this.user.set(user);
    let roles = await this.localStorage.getLocalData(localKeys.USER_ROLES);
    this.isMentor.set(!!roles?.includes('mentor'));
    if (user) {
      await this.profileService.getUserRole(user);
    }
    if (!this.isMentor() && !await this.localStorage.getLocalData(localKeys.IS_ROLE_REQUESTED) && !this.isMentorButtonPushed()) {
      this.buttonConfig.update((config) => ({
        ...config,
        buttons: [...config.buttons, this.becomeAMentorButton]
      }));
      this.isMentorButtonPushed.set(true);
    }
    this.formData.update((form) => ({
      ...form,
      data: {
        ...(form?.data || {}),
        ...(user || {}),
        emailId: user?.email,
        organizationName: user?.organization?.name
      }
    }));
    const currentProfileData = this.profileData();
    if (!currentProfileData?.about) {
      if (!this.visited() && !currentProfileData?.deleted) {
        this.router.navigate([CommonRoutes.EDIT_PROFILE], { replaceUrl: true });
      }
      this.visited.set(true);
    }
    this.showProfileDetails.set(true);
    this.gotToTop();
    await this.profileDetailsApi();
  }

  gotToTop() {
    this.content?.scrollToTop(1000);
  }


  async doRefresh(event){
    await this.profileDetailsApi();
    event.target.complete();
  }

  feedback() {
    this.navCtrl.navigateForward([CommonRoutes.FEEDBACK]);
  }
  async profileDetailsApi(){
    const response = await this.form.getForm(EDIT_PROFILE_FORM);
    const result = await this.profileService.getProfileDetailsFromAPI();
    const currentFormData = this.formData();
    const controls = [...currentFormData.controls];
    response.data.fields.controls.forEach(entity => {
      Object.entries(result).forEach(([key, value]) => {
        if(entity.type=='chip' &&  entity.name == key && !controls.some(obj => obj.key === entity.name)){
          controls.push(
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
    if (!controls.some(existingField => existingField.key === field.key)) {
      controls.push(field);
    }
  });
  let updatedData = this.profileData();
    if(result){
      updatedData = {
        ...result,
        emailId: result?.email,
        organizationName: this.user()?.organization?.name
      };
    }
    this.formData.set({
      ...currentFormData,
      controls,
      data: updatedData
    });
  }

  async upDateProfilePopup(msg:any = {header: 'UPDATE_PROFILE',message: 'PLEASE_UPDATE_YOUR_PROFILE_IN_ORDER_TO_PROCEED',cancel:'UPDATE',submit:'CANCEL'}){
    this.utilService.alertPopup(msg).then(async (data) => {
      if(!data){
        this.router.navigate([`/${CommonRoutes.EDIT_PROFILE}`], {replaceUrl:true});
      }
    }).catch(error => {})
  }
}
