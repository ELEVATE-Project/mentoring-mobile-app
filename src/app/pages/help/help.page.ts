import { Component, OnInit, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { DynamicFormComponent, JsonFormData } from 'src/app/shared/components/dynamic-form/dynamic-form.component';

@Component({
  selector: 'app-help',
  templateUrl: './help.page.html',
  styleUrls: ['./help.page.scss'],
})
export class HelpPage implements OnInit {
  @ViewChild('form1') form1: DynamicFormComponent;
  public headerConfig: any = {
    backButton: true,
    label: "Help"
  };
  formData: JsonFormData = {
    controls: [
      {
        "name": "issue",
        "label": "Tell us here",
        "value": "",
        "class": "ion-margin",
        "type": "text",
        "position": "floating",
        "validators": {}
      },
    ]
  };

  constructor() { }

  ngOnInit() {
  }

}