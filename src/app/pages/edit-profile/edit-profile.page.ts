import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpService } from 'src/app/core/services/http/http.service';
import {
  DynamicFormComponent,
  JsonFormData,
} from 'src/app/shared/components/dynamic-form/dynamic-form.component';
import { ProfileService } from 'src/app/shared/services/profile.service';

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
  constructor(private http: HttpClient, private api: HttpService, private profileService: ProfileService) { }
  async ngOnInit() {
    this.http
      .get('/assets/dummy/profile-form.json')
      .subscribe((formData: JsonFormData) => {
        this.formData = formData;
      });
  }

  onSubmit() {
    this.form1.onSubmit();
    if(this.form1.myForm.valid){
      this.profileService.profileUpdate(this.form1.myForm.value);
    }
  }

  resetForm() {
    this.form1.reset();
  }


}

