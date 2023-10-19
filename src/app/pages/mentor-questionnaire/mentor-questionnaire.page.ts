import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from 'src/app/core/services';
import { OrganisationService } from 'src/app/core/services/organisation/organisation.service';
import { DynamicFormComponent, JsonFormData } from 'src/app/shared/components/dynamic-form/dynamic-form.component';
import { CommonRoutes } from 'src/global.routes';

@Component({
  selector: 'app-mentor-questionnaire',
  templateUrl: './mentor-questionnaire.page.html',
  styleUrls: ['./mentor-questionnaire.page.scss'],
})
export class MentorQuestionnairePage implements OnInit {
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
  public headerConfig: any = {
    notification: false,
    backButton: {
      label: 'BECOME_A_MENTOR',
    },
  };

  constructor(private toast: ToastService, private router: Router, private organisation: OrganisationService) {}

  async ngOnInit() {
  }

  async RequestToBecomeMentor(){
    if(this.form1.myForm.valid){
      let role = await this.organisation.getRequestedRoleDetails('mentor');
      let data = await this.organisation.requestOrgRole(role.id,this.form1.myForm.value)
      this.router.navigate([`/${CommonRoutes.TABS}/${CommonRoutes.HOME}`])
    } else {
      this.toast.showToast("Please fill all the fields", "danger")
    }
  }

}
