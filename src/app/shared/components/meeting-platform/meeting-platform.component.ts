import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DynamicFormComponent, JsonFormData } from '../dynamic-form/dynamic-form.component';
import { FormService } from 'src/app/core/services/form/form.service';
import { PLATFORMS } from 'src/app/core/constants/formConstant';
import * as _ from 'lodash';
@Component({
  selector: 'app-meeting-platform',
  templateUrl: './meeting-platform.component.html',
  styleUrls: ['./meeting-platform.component.scss'],
})
export class MeetingPlatformComponent implements OnInit {
  @ViewChild('form1') form1: DynamicFormComponent;
  @Input() config: any;
  meetingPlatforms: any;
  selectedLink: any = "Big blue button (Default)";
  selectedHint: any = "Big Blue Button is the default meeting platform.";
  
  constructor(private form: FormService,) { }
  async ngOnInit() {
    const result = await this.form.getForm(PLATFORMS);
    this.meetingPlatforms = _.get(result, 'result.data.fields.forms');
  }
  clickOptions(options:any){
    this.selectedHint = options;
    console.log(this.selectedHint)
  }
}
