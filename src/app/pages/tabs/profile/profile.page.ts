import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  public headerConfig: any = {
    // menu: true,
    backButton: {
      label: 'Profile',
    },
    notification: true,
    headerColor: 'primary',
  };
  constructor(public navCtrl: NavController) { }

  ngOnInit() {
  }

  editProfile(){
    this.navCtrl.navigateForward('tabs/profile/edit-profile');
  }

  feedback(){
    this.navCtrl.navigateForward('/feedback');
  }

}
