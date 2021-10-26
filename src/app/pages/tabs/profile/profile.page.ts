import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { UtilService } from 'src/app/shared/service/util.service';
import { CommonRoutes } from 'src/global.routes';

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
  constructor(public navCtrl: NavController, private util: UtilService) {}

  ngOnInit() {
  }

  editProfile(){
    this.navCtrl.navigateForward('tabs/profile/edit-profile');
  }

  feedback(){
    this.navCtrl.navigateForward([CommonRoutes.feedBack]);
  }

  sharelink() {
    this.util.shareLink();
  }

  shareFile(file) {
    file.click();
  }
  Upload(event){
  this.util.shareFile(event.target.files[0]);
  }
}
