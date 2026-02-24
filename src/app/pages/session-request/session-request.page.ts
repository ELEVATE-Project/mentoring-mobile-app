import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService, UtilService } from 'src/app/core/services';
import { DynamicFormComponent } from 'src/app/shared/components';
import { CommonRoutes } from 'src/global.routes';
import { SessionService } from '../../core/services/session/session.service';
import { FormService } from 'src/app/core/services/form/form.service';
import { REQUEST_SESSION_FORM } from 'src/app/core/constants/formConstant';
import * as _ from 'lodash';
import * as moment from 'moment-timezone';
import { ModalController } from '@ionic/angular';
import { DynamicSelectModalComponent } from 'src/app/dynamic-select-modal/dynamic-select-modal.component';

@Component({
    selector: 'app-session-request',
    templateUrl: './session-request.page.html',
    styleUrls: ['./session-request.page.scss'],
    standalone: false
})
export class SessionRequestPage implements OnInit {

  @ViewChild('form1') form1: DynamicFormComponent;
  isSubmited: boolean = false;
  ids: any = {};
  formData: any;
  timezones: string[] = moment.tz.names(); // All timezones
  selectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  constructor(private router: Router, private toast: ToastService, private activatedRoute: ActivatedRoute,
    private sessionService: SessionService, private form: FormService, private modalController: ModalController, private utilService: UtilService
  ) { }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    this.activatedRoute.queryParams.subscribe(({ data }) => this.ids.requestee_id = data);
    const result = await this.form.getForm(REQUEST_SESSION_FORM);
    this.formData = _.get(result, 'data.fields');
  }

 
  public headerConfig: any = {
    backButton: true,
    label: "Set agenda",
    headerColor: 'primary'
  };

    async onDynamicSelectClicked() {

    const modal = await this.modalController.create({
      component: DynamicSelectModalComponent,
      componentProps: {
        items: this.timezones ? this.timezones : [],
        selectedItem: this.selectedTimezone,
        title: 'SELECT_TIMEZONE',
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.selectedTimezone = result.data;
      }
    });

    return await modal.present();
}
  onSubmit(){
    if(!this.isSubmited){
      this.form1.onSubmit();
    }
    if(this.form1.myForm.valid){
          const form = Object.assign({}, {...this.form1.myForm.getRawValue(), ...this.form1.myForm.value}, { ...this.ids});
          const result = this.utilService.convertDatesToTimezone(
          form.start_date,
          form.end_date,
          this.selectedTimezone
          );
          form.start_date = result.eventStartEpochInSelectedTZ /1000;
          form.end_date = result.eventEndEpochInSelectedTZ / 1000;
          form.time_zone = this.selectedTimezone;
          this.form1.myForm.markAsPristine();
          this.sessionService.requestSession(form).then((res) => {
            if (res) {
              this.router.navigate([`/${CommonRoutes.TABS}/${CommonRoutes.REQUESTS}`]);
              this.toast.showToast(res.message, "success");
              this.isSubmited = true;
              this.form1.reset();
            }}).catch((err) => {});

      
    }
  }

}
