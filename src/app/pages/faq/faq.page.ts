import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FAQ } from 'src/app/core/constants/formConstant';
import { FormService } from 'src/app/core/services/form/form.service';
import { CommonRoutes } from 'src/global.routes';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.page.html',
  styleUrls: ['./faq.page.scss'],
})
export class FaqPage implements OnInit {
  public headerConfig: any = {
    backButton: true,
    label: 'FAQ',
  };
  faqArray = [];
  constructor(private router: Router, private form: FormService) {}

  async ngOnInit() {
    let result = await this.form.getForm(FAQ)
    this.faqArray = result.result.data.fields.controls
  }
  async goToHome() {
    this.router.navigate([`/${CommonRoutes.TABS}/${CommonRoutes.HOME}`])
  }

}
