import { Component, OnInit } from '@angular/core';
import { JsonFormData } from 'src/app/shared/components/dynamic-form/dynamic-form.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  formData: JsonFormData;
  constructor() {}

  ngOnInit() {
    this.formData = {
      controls: [
        {
          name: 'email',
          label: 'Email:',
          value: '',
          class: 'ion-margin',
          type: 'text',
          position: 'floating',
          validators: {
            required: true,
          },
        },
      ],
    };
  }
}
