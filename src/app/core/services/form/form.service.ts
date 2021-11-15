import { Injectable } from '@angular/core';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { DbService, HttpService } from 'src/app/core/services';
import * as _ from 'lodash-es';

@Injectable({
  providedIn: 'root',
})
export class FormService {
  constructor(private http: HttpService, private db: DbService) {}

  getForm = async (formBody) => {
    //check form in sqlite db with primary_key as UniqueKey
    let dbForm: any = await this.db.query(
      `SELECT * FROM forms where primary_key=?`,
      [this.getUniqueKey(formBody)]
    );
    dbForm = dbForm[0];
    // check if db form is expired
    if (dbForm && !this.checkIfexpired(dbForm.ttl)) {
      console.log(dbForm);
      return JSON.parse(dbForm.form);
    }
    //if db form expired or not present then call api
    const args = {
      url: urlConstants.API_URLS.FORM_READ,
      payload: formBody,
    };
    const resp = await this.http.post(args);
    // store api response in db with 24hrs expiryTime
    if (!_.has(resp, 'result.data.fields')) {
      return resp; // if form is not present return without storing
    }
    this.db
      .store(
        `INSERT OR REPLACE INTO forms (primary_key,form,ttl) VALUES(?,?,?);`,
        [
          this.getUniqueKey(formBody),
          JSON.stringify(resp),
          this.timeToExpire(24),
        ]
      )
      .then((res) => {
        console.log(res);
      });
    return resp;
  };

  getUniqueKey = (object) => Object.values(object).join('_'); // get '_' seperated object values in string format
  timeToExpire = (h) => new Date(Date.now() + 1000 * 60 * 60 * h).getTime(); //get unix time of expiry by passing hour
  checkIfexpired = (unix) => unix < Date.now(); // pass unix time to check,true if expired else false
}
