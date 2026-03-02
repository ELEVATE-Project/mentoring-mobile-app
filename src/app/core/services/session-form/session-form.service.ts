import { Injectable } from '@angular/core';
import { FormService } from '../form/form.service';
import { PLATFORMS } from '../../constants/formConstant';
import * as _ from 'lodash-es';

@Injectable({
  providedIn: 'root'
})
export class SessionFormService {

  constructor(private form: FormService) {}

  async getPlatformFormDetails(): Promise<{ meetingPlatforms: any; selectedLink: any; selectedHint: any }> {
    let form = await this.form.getForm(PLATFORMS);
    const meetingPlatforms = form.data.fields.forms;
    const selectedLink = meetingPlatforms[0];
    const selectedHint = meetingPlatforms[0].hint;
    return { meetingPlatforms, selectedLink, selectedHint };
  }

  async preFillData(
    data: any,
    formData: any,
    meetingPlatforms: any[],
    id: any,
    entityNames: any[],
    routeQueryParams: any
  ): Promise<{
    formData: any;
    selectedLink: any;
    selectedHint: any;
    isNotCompleted: boolean;
    sessionType: any;
    mentor_id: any;
    showForm: boolean;
  }> {
    let existingData = await this.form.formatEntityOptions(data, entityNames);

    let selectedLink: any;
    let selectedHint: any;
    let isNotCompleted: boolean = true;
    let sessionType: any;
    let mentor_id: any;

    for (let j = 0; j < meetingPlatforms?.length; j++) {
      if (existingData.meeting_info.platform == meetingPlatforms[j].name) {
        selectedLink = meetingPlatforms[j];
        selectedHint = meetingPlatforms[j].hint;
        let obj = meetingPlatforms[j]?.form?.controls.find((link: any) => link?.name == 'link');
        let meetingId = meetingPlatforms[j]?.form?.controls.find((meetingId: any) => meetingId?.name == 'meetingId')
        let password = meetingPlatforms[j]?.form?.controls.find((password: any) => password?.name == 'password')
        if (obj && existingData?.meeting_info?.link) {
          obj.value = existingData?.meeting_info?.link;
        }
        if (existingData?.meeting_info?.meta?.meetingId) {
          meetingId.value = existingData?.meeting_info?.meta?.meetingId;
          password.value = existingData?.meeting_info?.meta?.password;
        }
      }
    }

    for (let i = 0; i < formData.controls.length; i++) {
      formData.controls[i].value =
        existingData[formData.controls[i].name];
      formData.controls[i].disabled = formData.controls[i].name !== "post" && existingData.status.value === "COMPLETED" ? true : false;
      isNotCompleted = existingData.status.value !== "COMPLETED";
      if (
        formData.controls[i].name == "post" && existingData.status.value !== "COMPLETED"
      ) {
        formData.controls[i].disabled = true;
      }
      if (formData.controls[i].type == 'search' && formData.controls[i].meta.addPopupType !== 'file') {
        formData.controls[i].id = id;
        if (formData.controls[i].meta.multiSelect) {
          formData.controls[i] = {
            ...formData.controls[i],
            meta: {
              ...formData.controls[i].meta,
              searchData: existingData[formData.controls[i].name]
            }
          };

          formData.controls[i].value = formData.controls[i].meta.searchData ? formData.controls[i].meta.searchData.map(obj => obj.id || obj.value) : [];
        } else {
          if (existingData[formData.controls[i].name]) {
            formData.controls[i] = {
              ...formData.controls[i],
              meta: {
                ...formData.controls[i].meta,
                searchData: [{
                  label: `${existingData.mentor_name}, ${existingData.organization}`,
                  id: existingData[formData.controls[i].name]
                }]
              }
            };
          }
        }
        if (!formData.controls[i].meta.disableIfSelected && existingData.status.value !== "COMPLETED") {
          formData.controls[i].disabled = false;
        }
        if (formData.controls[i].meta.disableIfSelected && formData.controls[i].value && existingData.status.value !== "COMPLETED" && formData.controls[i].meta.addPopupType !== 'file') {
          if (formData.controls[i].name === 'mentor_id') {
            if (existingData[formData.controls[i].name]) {
              formData.controls[i].disabled = true;
            }
          } else {
            formData.controls[i].disabled = true;
          }
        }
      } else if (formData.controls[i].type === 'search' && formData.controls[i].meta.addPopupType === 'file') {
        const controlName = formData.controls[i].name;
        if (existingData.resources?.length) {
          const filteredResources = existingData.resources
            .filter(resource => resource.type === controlName)
            .map(resource =>
            ({
              label: resource.name,
              id: resource.id,
              type: resource.type,
              link: resource.link
            })
            );
          if (filteredResources) {
            formData.controls[i].value = filteredResources.map(r => r);

            formData.controls[i] = {
              ...formData.controls[i],
              meta: {
                ...formData.controls[i].meta,
                searchData: filteredResources
              }
            };
          }
        }
        formData.controls[i].id = id;
        if (!formData.controls[i].meta.disableIfSelected && existingData.status.value !== "COMPLETED" && formData.controls[i].meta.addPopupType !== 'file') {
          formData.controls[i].disabled = false;
        }
        if (formData.controls[i].meta.disableIfSelected && formData.controls[i].value?.length && existingData.status.value !== "COMPLETED") {
          formData.controls[i].disabled = true;
        }
      }
      let dependedChildIndex = formData.controls.findIndex(formControl => formControl.name === formData.controls[i].dependedChild)
      if (existingData['mentor_id']) {
        mentor_id = existingData['mentor_id'];
      }
      if (formData.controls[i].dependedChild && formData.controls[i].name === 'type') {
        if (existingData[formData.controls[i].name].value) {
          formData.controls[i].disabled = true;
          sessionType = existingData[formData.controls[i].name].value;
          formData.controls[dependedChildIndex].validators['required'] = existingData[formData.controls[i].name].value == 'PUBLIC' ? false : true
        }
      }
      if (formData.controls[i]?.name === "mentees") {
        const { isCreator } = routeQueryParams;
        if (!mentor_id) {
          formData.controls[i].disabled = true;
        }
        if (isCreator === 'true' && sessionType === 'PUBLIC') {
          formData.controls[i].showField = false;
        }
      }
      formData.controls[i].options = _.unionBy(
        formData.controls[i].options,
        formData.controls[i].value, 'value'
      );
    }
    formData.controls = [...formData.controls];

    return {
      formData,
      selectedLink,
      selectedHint,
      isNotCompleted,
      sessionType,
      mentor_id,
      showForm: true
    };
  }
}
