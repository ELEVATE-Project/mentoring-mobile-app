import { Component, Input, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { CommonRoutes } from 'src/global.routes';

@Component({
  selector: 'app-generic-profile-header',
  templateUrl: './generic-profile-header.component.html',
  styleUrls: ['./generic-profile-header.component.scss'],
})
export class GenericProfileHeaderComponent implements OnInit {
  @Input() headerData:any;
  @Input() showEdit:any

  constructor(private navCtrl:NavController) { }

  ngOnInit() {
  }

  editProfile() {
    this.navCtrl.navigateForward(CommonRoutes.EDIT_PROFILE);
  }

}
