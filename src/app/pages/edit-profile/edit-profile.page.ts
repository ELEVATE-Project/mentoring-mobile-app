import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpService } from 'src/app/core/services/http/http.service';
import {
  DynamicFormComponent,
  JsonFormData,
} from 'src/app/shared/components/dynamic-form/dynamic-form.component';
import {
  FormService,
  PROFILE_FORM,
} from 'src/app/shared/services/form/form.service';
import * as _ from 'lodash-es';
import { ProfileService } from 'src/app/shared/services/profile/profile.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
})
export class EditProfilePage implements OnInit {
  @ViewChild('form1') form1: DynamicFormComponent;

  public headerConfig: any = {
    // menu: true,
    backButton: {
      label: 'Profile Details',
    },
    notification: false,
    headerColor: 'white',
  };

  public formData: JsonFormData;
  constructor(
    private form: FormService,
    private api: HttpService,
    private profileService: ProfileService
  ) {}
  async ngOnInit() {
    const response = await this.form.getForm(PROFILE_FORM);
    this.formData = _.get(response, 'result.data.fields');
  }

  onSubmit() {
    this.form1.onSubmit();
    if (this.form1.myForm.valid) {
      this.profileService.profileUpdate(this.form1.myForm.value);
    }
  }

  resetForm() {
    this.form1.reset();
  }
}
