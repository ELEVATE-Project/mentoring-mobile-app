import { Injectable } from '@angular/core';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { HttpService } from 'src/app/core/services';

export const PROFILE_FORM = {
  type: 'profile',
  subType: 'createProfile',
  action: 'formFields',
  ver: '1.0',
  templateName: 'defaultTemplate',
};

@Injectable({
  providedIn: 'root',
})
export class FormService {
  constructor(private http: HttpService) {}

  getForm = (formBody) => {
    const args = {
      url: urlConstants.API_URLS.FORM_READ,
      payload: formBody,
    };
    return this.http.post(args);
  };
}
