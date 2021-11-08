import { Component, Input, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ProfileService } from 'src/app/shared/services/profile.service';
import { CommonRoutes } from 'src/global.routes';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  profileImageData: any;
  formData: any;
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

  editProfile(){
    this.navCtrl.navigateForward('tabs/profile/edit-profile');
  }

  feedback(){
    this.navCtrl.navigateForward([CommonRoutes.FEEDBACK]);
  }
}
