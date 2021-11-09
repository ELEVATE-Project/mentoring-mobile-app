import { Component, Input, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ProfileService } from 'src/app/shared/services/profile.service';
import { CommonRoutes } from 'src/global.routes';
import * as _ from 'lodash-es';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  profileImageData: any;
  formData: any= {
    form: [
      {
        title: 'About',
        key: 'about',
      },
      {
        title: 'Designation',
        key: 'designation',
      },
      {
        title: 'Year Of Experience',
        key: 'experience',
      },
      {
        title: "key Areas Of Expertise",
        key: "areasOfExpertise"
      },
      {
        title: "Languages",
        key: "languages"
      }
    ],
    data: {},
  };
  data: any;
  public headerConfig: any = {
    // menu: true,
    backButton: {
      label: 'Profile',
    },
    notification: true,
    headerColor: 'primary',
  };
  constructor(public navCtrl: NavController, private profileService: ProfileService) { }

  ngOnInit() {
  }
  ionViewWillEnter(){
    this.fetchProfileDetails();
  }

  async fetchProfileDetails(){
    var response = await this.profileService.profileDetails();
    this.formData.data = _.get(response, 'result');
    this.profileImageData= _.get(response, 'result');
  }

  editProfile(){
    this.navCtrl.navigateForward('tabs/profile/edit-profile');
  }

  feedback(){
    this.navCtrl.navigateForward([CommonRoutes.FEEDBACK]);
  }
}
