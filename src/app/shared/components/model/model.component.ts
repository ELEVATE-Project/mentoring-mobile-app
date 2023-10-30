import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DynamicFormComponent } from '../dynamic-form/dynamic-form.component';
import { UtilService } from 'src/app/core/services';

@Component({
  selector: 'app-model',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.css']
})
export class ModelComponent implements OnInit {
  @Input("readonly") readonly;
  @Input("data") data;
  @ViewChild('form1') form1: DynamicFormComponent;
  formData: any;
  
  constructor(private util: UtilService) { }

  ngOnInit(): void {
    this.formData = this.data.form
  }

  formValid(){
    this.fillFormValues()
  }

  fillFormValues() {
    let formControls = this.form1.myForm.controls
    this.formData.controls.forEach((control)=>{
      if (this.data.hasOwnProperty(control.name)) {
        const formControl = formControls[control.name];
        formControl.setValue(this.data[control.name])
      }
    })
  }

  closeModal() {
    this.util.modal.dismiss();
  }

}
