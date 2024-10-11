import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Output,
  ViewChild,
  EventEmitter,
  ViewChildren,
  QueryList
} from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import * as _ from 'lodash-es';
import { ToastService } from 'src/app/core/services';
import { ThemePalette } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { debounceTime } from 'rxjs/operators';
import { SearchAndSelectComponent } from '../search-and-select/search-and-select.component';
import { OWL_DATE_TIME_FORMATS } from '@danielmoncada/angular-datetime-picker';

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

interface JsonFormErrorMessages {
  required?: string;
  email?: string;
  minlength?: string;
  pattern?: string;
  min?: string;
  max?: string;
  requiredtrue?: string;
  nullvalidator?: string;
}

interface JsonFormControls {
  id?: any;
  searchData?: Array<object>;
  name: string;
  label: string;
  value: any;
  type: string;
  class: string;
  position: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<object>;
  validators: JsonFormValidators;
  numberOfStars?:number;
  errorMessage?:JsonFormErrorMessages;
  dependentKey?:string;
  isNumberOnly?: boolean;
  alertLabel?: string;
  platformPlaceHolder?:string;
  showSelectAll?: boolean;
  multiple?:boolean;
  placeHolder?: string;
  displayFormat?: string;
  dependedChild?: string;
  dependedParent?: string;
  meta?: any;
  multiSelect?: boolean;
  info?: Array<object>
}
export interface JsonFormData {
  controls: JsonFormControls[];
}

const CUSTOM_DATE_FORMATS = {
  fullPickerInput: {year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true},
  datePickerInput: {year: 'numeric', month: 'long', day: 'numeric'},
  timePickerInput: {hour: 'numeric', minute: 'numeric', hour12: true},
  monthYearLabel: {year: 'numeric', month: 'long'},
  dateA11yLabel: {year: 'numeric', month: 'long', day: 'numeric'},
  monthYearA11yLabel: {year: 'numeric', month: 'long'},
};

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss'],
  providers: [
    {
      provide: OWL_DATE_TIME_FORMATS, useValue: CUSTOM_DATE_FORMATS
    }
]
})
export class DynamicFormComponent implements OnInit {
  @Input() jsonFormData: any;
  @Input() readonly: any = false;
  @Output() formValid = new EventEmitter()
  @Output() onEnter = new EventEmitter()
  @Output() formValueChanged = new EventEmitter()
  @ViewChild('picker') picker: MatDatepicker<Date>;
  @ViewChildren(SearchAndSelectComponent) searchAndSelectComponents: QueryList<SearchAndSelectComponent>;
  @Output() customEventEmitter = new EventEmitter()
  
  public showSpinners = true;
  public showSeconds = false;
  public touchUi = false;
  public enableMeridian = true;
  public stepHour = 1;
  public stepMinute = 1;
  public stepSecond = 1;
  public color: ThemePalette = 'warn';


  public myForm: UntypedFormGroup = this.fb.group({});
  showForm = false;
  currentDate = new Date();
  maxDate = new Date(new Date().setFullYear(new Date().getFullYear() + 10));
  dependedChild: any;
  dependedChildDate="";
  dependedParent: any;
  dependedParentDate: any;

  constructor(private fb: UntypedFormBuilder, private toast: ToastService) {}
  ngOnInit() {
    this.jsonFormData.controls.find((element, index) => {
      if(element.type == "select"){
        this.jsonFormData.controls[index].options = _.sortBy(this.jsonFormData.controls[index].options, ['label']);
        if(this.jsonFormData.controls[index].multiple){
          this.jsonFormData.controls[index].value = this.jsonFormData.controls[index].value === null ? [] : this.jsonFormData.controls[index].value
        } else {
          this.jsonFormData.controls[index].value = this.jsonFormData.controls[index].value === null ? '' : this.jsonFormData.controls[index].value.value
        }
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
    this.formValid.emit(this.myForm.valid)
    if(this.readonly){
      this.myForm.disable()
    }
  }
  compareWith(a, b) {
    a = _.flatten([a]);
    b = _.flatten([b]);
    return JSON.stringify(a) == JSON.stringify(b);
  }
  onSubmit() {
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

  dateSelected(event, control){
    if(event.value < this.currentDate) {
      this.myForm.controls[control.name].setValue(this.currentDate);
    }
    if(control.dependedChild){
      this.dependedChild = control.dependedChild;
      this.dependedChildDate = event.value;
      if(event.value > new Date(this.myForm.controls[this.dependedChild].value)) {
        this.myForm.controls[this.dependedChild].setValue(this.dependedChildDate);
      }
    }    
  }

  dateInputClick(control, datetimePicker) {
    this.currentDate = new Date();
    if (this.myForm.get(control.name).value)
      datetimePicker._selected = this.myForm.get(control.name).value;
    datetimePicker.open();
  }

  selectionChanged(control, event){
    const indexToEdit = this.jsonFormData.controls.findIndex(formControl => formControl.name === control.name);
    if (indexToEdit !== -1) {
      this.jsonFormData.controls[indexToEdit].value = event.detail.value
    }
    this.formValueChanged.emit(control)
  }
  
  removeSpace(event: any){
    event.target.value = event.target.value.trimStart()
  }

  onEnterPress(event){
    if(this.myForm.valid){
      this.onEnter.emit(event)
    }
  }

  searchEventEmitter(event){
    const componentInstance = this.searchAndSelectComponents.find(comp => comp.uniqueId === event.id);
    if (componentInstance) {
      event.formControl = componentInstance
      this.customEventEmitter.emit(event)
    }    
  }
}
