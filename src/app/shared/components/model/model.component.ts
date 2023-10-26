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
  
  formData = {
    controls: [
      {
        name: 'name',
        label: 'Name',
        value: '',
        class: 'ion-margin',
        type: 'text',
        position: 'floating',
        errorMessage:{
          required: "Enter your name",
          pattern: "This field can only contain alphabets"
        },
        validators: {
          required: true,
          pattern:'^[a-zA-Z ]*$',
        },
      },
      {
        name: 'role',
        label: 'Role',
        value: '',
        class: 'ion-margin',
        type: 'text',
        position: 'floating',
        errorMessage:{
          required: "Enter your role",
          pattern: "This field can only contain alphabets"
        },
        validators: {
          required: true,
          pattern:'^[a-zA-Z ]*$',
        },
      },
      {
        name: 'experience',
        label: 'Year of Experience',
        value: '',
        class: 'ion-margin',
        type: 'number',
        position: 'floating',
        errorMessage:{
          required: "Enter your experience",
          pattern: "This field can only contain numbers"
        },
        validators: {
          required: true,
        },
      },
      {
        name: 'area_of_expertise',
        label: 'Area of Expertise',
        value: '',
        class: 'ion-margin',
        type: 'chip',
        meta: {
          showSelectAll: true,
        },
        position: 'floating',
        errorMessage:{
          required: "Add your Expertise"
        },
        options: [{label: 'Scool Management', value: 'SM'},{label: 'Technology', value: 'Tech'},{label: "Subject Teaching", value: "ST"}],
        validators: {
          required: true,
        },
      },
      {
        name: 'about',
        label: 'About',
        value: '',
        class: 'ion-margin',
        type: 'textarea',
        position: 'floating',
        errorMessage:{
          required: "Tell us few lines about yourself",
        },
        validators: {
          required: true,
        },
      }
    ]
  }
  
  constructor(private util: UtilService) { }

  ngOnInit(): void {
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
