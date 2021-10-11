import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { JsonFormData } from 'src/app/shared/components/dynamic-form/dynamic-form.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page implements OnInit {
  public formData: JsonFormData;

  constructor(private http: HttpClient) {}
  ngOnInit() {
    this.http
      .get('/assets/dummy/dynamic-form.json')
      .subscribe((formData: JsonFormData) => {
        this.formData = formData;
      });
  }
}
