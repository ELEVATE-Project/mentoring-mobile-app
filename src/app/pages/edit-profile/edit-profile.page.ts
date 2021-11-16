import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpService } from 'src/app/core/services/http/http.service';
import {
  DynamicFormComponent,
  JsonFormData,
} from 'src/app/shared/components/dynamic-form/dynamic-form.component';
import {
  FormService,
} from 'src/app/core/services/form/form.service';
import * as _ from 'lodash-es';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { EDIT_PROFILE_FORM } from 'src/app/core/constants/formConstant';
import { LocalStorageService } from 'src/app/core/services';
import { localKeys } from 'src/app/core/constants/localStorage.keys';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
})
export class EditProfilePage implements OnInit {
  @ViewChild('form1') form1: DynamicFormComponent;
  profileImageData ={
    type :'profile'
  }
  public headerConfig: any = {
    // menu: true,
    backButton: {
      label: 'Profile Details',
    },
    notification: false,
    headerColor: 'white',
  };

  public formData: JsonFormData;
  showForm: any= false;
  constructor(
    private form: FormService,
    private api: HttpService,
    private profileService: ProfileService,
    private localStorage: LocalStorageService
  ) { }
  async ngOnInit() {
    const response = await this.form.getForm(EDIT_PROFILE_FORM);
    this.formData = _.get(response, 'result.data.fields');
    let userDetails =  await this.localStorage.getLocalData(localKeys.USER_DETAILS);
      let existingData = userDetails.user;
      this.preFillData(existingData);
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

 preFillData(existingData) {
    for (let i = 0; i < this.formData.controls.length; i++) {
      this.formData.controls[i].value =
        existingData[this.formData.controls[i].name];
      this.formData.controls[i].options = _.unionBy(
        this.formData.controls[i].options,
        this.formData.controls[i].value,'value'
      );
    }
    this.showForm = true;
  }
}