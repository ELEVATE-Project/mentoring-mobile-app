import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IonDatetime } from '@ionic/angular';
import * as _ from 'lodash-es';
import * as moment from 'moment';
import { ToastService } from 'src/app/core/services';

interface JsonFormValidators {
  min?: number;
  max?: number;
  required?: boolean;
  requiredTrue?: boolean;
  email?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  nullValidator?: boolean;
}
interface JsonFormControlOptions {
  min?: string;
  max?: string;
  step?: string;
  icon?: string;
}
interface JsonFormControls {
  name: string;
  label: string;
  value: string;
  type: string;
  class: string;
  position: string;
  required?: boolean;
  disabled?: boolean;
  options?: JsonFormControlOptions;
  validators: JsonFormValidators;
  numberOfStars?:number;
  errorMessage?:string;
  dependentKey?:string;
  isNumberOnly?: boolean;
  alertLabel?: string;
}
export interface JsonFormData {
  controls: JsonFormControls[];
}

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss'],
})
export class DynamicFormComponent implements OnInit {
  @Input() jsonFormData: any;
  public myForm: FormGroup = this.fb.group({});
  showForm = false;
  currentDate = moment().format("YYYY-MM-DDTHH:mm");
  maxDate = moment(this.currentDate).add(10, "years").format("YYYY-MM-DDTHH:mm");
  dependedChild: any;
  dependedChildDate="";
  dependedParent: any;
  dependedParentDate: any;

  constructor(private fb: FormBuilder, private toast: ToastService, private changeDetRef: ChangeDetectorRef) {}
  ngOnInit() {
    this.jsonFormData.controls.find((element, index) => {
      if(element.type == "select"){
        console.log(element, index);
        this.jsonFormData.controls[index].options = _.sortBy(this.jsonFormData.controls[index].options, ['label']);
      }
    });
    setTimeout(() => {
      this.createForm(this.jsonFormData.controls);
      this.showForm = true;
    });
  }

  createForm(controls: JsonFormControls[]) {
    for (const control of controls) {
      const validatorsToAdd = [];
      for (const [key, value] of Object.entries(control.validators)) {
        switch (key) {
          case 'min':
            validatorsToAdd.push(Validators.min(value));
            break;
          case 'max':
            validatorsToAdd.push(Validators.max(value));
            break;
          case 'required':
            if (value) {
              validatorsToAdd.push(Validators.required);
            }
            break;
          case 'requiredTrue':
            if (value) {
              validatorsToAdd.push(Validators.requiredTrue);
            }
            break;
          case 'email':
            if (value) {
              validatorsToAdd.push(Validators.email);
            }
            break;
          case 'minLength':
            validatorsToAdd.push(Validators.minLength(value));
            break;
          case 'maxLength':
            validatorsToAdd.push(Validators.maxLength(value));
            break;
          case 'pattern':
            validatorsToAdd.push(Validators.pattern(value));
            break;
          case 'nullValidator':
            if (value) {
              validatorsToAdd.push(Validators.nullValidator);
            }
            break;
          default:
            break;
        }
      }
      this.myForm.addControl(
        control.name,
        this.fb.control(
          { value: control.value, disabled: control.disabled },
          validatorsToAdd
        )
      );
    }
  }
  compareWith(a, b) {
    a = _.flatten([a]);
    b = _.flatten([b]);
    return JSON.stringify(a) == JSON.stringify(b);
  }
  onSubmit() {
    console.log('Form valid: ', this.myForm.valid);
    console.log('Form values: ', this.myForm.value);
    this.isFormValid();
  }
  reset() {
    this.myForm.reset();
  }

  isFormValid() {
    return this.myForm.statusChanges;
  }

  hideShowPassword(control) {
    //  this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
    control.type = control.type === 'text' ? 'password' : 'text';
    control.showPasswordIcon = true;
  }
  alertToast(){
    this.toast.showToast("Please refer to the on-boarding email for your secret code", "success")
  }

  dateSelected(event, control){
    if(control.dependedChild){
      this.dependedChild = control.dependedChild;
      this.dependedChildDate = event.detail.value;
    } else {
      this.dependedParent = control.dependedParent
      this.dependedParentDate = event.detail.value;
    }
  }
}
