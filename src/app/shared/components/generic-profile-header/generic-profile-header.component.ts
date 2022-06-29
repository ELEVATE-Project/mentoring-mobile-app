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
  @Input() buttonConfig:any;
  @Input() showRole:any;

  constructor(private navCtrl:NavController) { }

  ngOnInit() {
  }

  action(event) {
    (event==="edit")?this.navCtrl.navigateForward(CommonRoutes.EDIT_PROFILE):console.log(event.action);
  }

}
