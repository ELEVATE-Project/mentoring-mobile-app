import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from 'src/app/core/services';
import { HttpService } from 'src/app/core/services/http/http.service';
import { SessionService } from 'src/app/core/services/session/session.service';
import {
  DynamicFormComponent,
  JsonFormData,
} from 'src/app/shared/components/dynamic-form/dynamic-form.component';
import { CommonRoutes } from 'src/global.routes';

@Component({
  selector: 'app-create-session',
  templateUrl: './create-session.page.html',
  styleUrls: ['./create-session.page.scss'],
})
export class CreateSessionPage implements OnInit {
  @ViewChild('form1') form1: DynamicFormComponent;

  public headerConfig: any = {
    // menu: true,
    backButton: {
      label: 'Create Session',
    },
    notification: false,
    headerColor: 'white',
  };
  profileImageData:{};
  public formData: JsonFormData;
  constructor(private http: HttpClient, private sessionService: SessionService, private api: HttpService, private toast: ToastService, private router: Router) { }
  async ngOnInit() {
    this.http
      .get('/assets/dummy/createSession-form.json')
      .subscribe((formData: JsonFormData) => {
        this.formData = formData;
      });
  }

  onSubmit() {
    this.form1.onSubmit();
    let result = this.sessionService.createSession(this.form1.myForm.value);
    if(result){
      this.router.navigate([`/${CommonRoutes.SESSIONS_DETAILS}`]);
    }
  }

  resetForm() {
    this.form1.reset();
  }


}
