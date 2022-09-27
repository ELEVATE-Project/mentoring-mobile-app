import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HELP_VIDEOS } from 'src/app/core/constants/formConstant';
import { FormService } from 'src/app/core/services/form/form.service';
import { CommonRoutes } from 'src/global.routes';

@Component({
  selector: 'app-help-video',
  templateUrl: './help-video.page.html',
  styleUrls: ['./help-video.page.scss'],
})
export class HelpVideoPage implements OnInit {

  public headerConfig: any = {
    backButton: true,
    label: "HELP_VIDEOS"
  };

  items = []

  constructor(private router: Router, private form: FormService) { }

  async ngOnInit() {
    let result = await this.form.getForm(HELP_VIDEOS);
    this.items = result.result.data.fields.controls;
  }

  goToHome() {
    this.router?.navigate([`${CommonRoutes.TABS}/${CommonRoutes.HOME}`]);
  }

}
