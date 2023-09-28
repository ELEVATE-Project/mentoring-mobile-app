import { Injectable } from '@angular/core';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { DbService, HttpService } from 'src/app/core/services';
import * as _ from 'lodash-es';

@Injectable({
  providedIn: 'root',
})
export class FormService {
  constructor(private http: HttpService, private db: DbService) { }

  getForm = async (formBody) => {
    //Check if form is available in local DB
    let form = await this.db.getItem(this.getUniqueKey(formBody))
    let dbForm = JSON.parse(form);

    // Check if local form is expired; return the form if not expired
    if (form && !this.checkIfexpired(dbForm?.ttl)) {
      return dbForm;
    }

    //Get the form from API
    const args = {
      url: urlConstants.API_URLS.FORM_READ,
      payload: formBody,
    };
    const resp = await this.http.post(args);
    if (!_.has(resp, 'result.data.fields')) {
      return resp.result; // if form is not present return without storing
    }
    
    // Store api response in db with 24hrs expiryTime
    resp.ttl = this.timeToExpire(24)
    await this.db.setItem(this.getUniqueKey(formBody), JSON.stringify(resp.result))
    return resp.result;
  };

  getUniqueKey = (object) => Object.values(object).join('_'); // get '_' seperated object values in string format
  timeToExpire = (h) => new Date(Date.now() + 1000 * 60 * 60 * h).getTime(); //get unix time of expiry by passing hour
  checkIfexpired = (unix) => unix < Date.now(); // pass unix time to check,true if expired else false
}
