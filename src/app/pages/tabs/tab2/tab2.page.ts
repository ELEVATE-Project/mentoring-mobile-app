import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpService } from 'src/app/core/services/http/http.service';
import {
  DynamicFormComponent,
  JsonFormData,
} from 'src/app/shared/components/dynamic-form/dynamic-form.component';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
})
export class Tab2Page implements OnInit {
  @ViewChild('form1') form1: DynamicFormComponent;

  public headerConfig: any = {
    backButton: {
      label: 'Tab1',
    },
    notification: true,
    headerColor: 'primary',
  };

  public formData: JsonFormData;

  constructor(private http: HttpClient, private api: HttpService) {
    this.http
      .get('/assets/dummy/dynamic-form.json')
      .subscribe((formData: JsonFormData) => {
        this.formData = formData;
      });
  }
  async ngOnInit() {
  }

  onSubmit() {
    this.form1.onSubmit();
  }

  resetForm() {
    this.form1.reset();
  }
}
