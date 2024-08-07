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

  async getEntities(entityTypes, type) {
    const config = {
      url: urlConstants.API_URLS.GET_ENTITY_LIST[type],
      payload: entityTypes.length ? { value: entityTypes } : {}
    };
    try {
      let data = await this.http.post(config);
      let result = _.get(data, 'result.entity_types');
      return result? result:data;
    }
    catch (error) {
    }
  }

  getEntityNames(formData){
    return formData.controls
    .filter((filterData)=> filterData?.meta && filterData.meta.entityType)
    .map((data)=> data.meta.entityType)
  }

  async populateEntity(formData, entityList){
    _.forEach(formData.controls, (formData) => {
      const entity = _.find(entityList, (entityData) => formData.name === entityData.value);
      if (entity) {
        formData.options = entity.entities.map((entityItem)=>{ return { label : entityItem.label, value : entityItem.value }});
        formData.meta = {
          ...formData.meta,
          entityId: entity.id,
          allow_custom_entities: entity.allow_custom_entities,
          allow_filtering: entity.allow_filtering
        };
        formData.validators = {
          ...formData.validators,
          required: entity.required
        }
      }
    });
    return formData
  }

  async formatEntityOptions(existingData, entityList){
    await entityList.map((entityName)=>{
      if(Array.isArray(existingData[entityName])){
        existingData[entityName] = existingData[entityName].map((data)=>{
          return { label : data.label, value : data.value == 'other' ? data.label : data.value }
        })
      }
    })
    return existingData
  }

  async filterList(obj){
    const config = {
      url: urlConstants.API_URLS.FILTER_LIST + '&organization=' + obj?.org + '&filter_type=' + obj?.filterType,
      payload: {},
    };
    try {
      const data: any = await this.http.get(config);
      return data.result
    }
    catch (error) {
      return null;
    }
  }
}
