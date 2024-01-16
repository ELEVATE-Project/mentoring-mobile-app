import { Injectable } from '@angular/core';
import { HttpService } from '../http/http.service';
import { urlConstants } from '../../constants/urlConstants';
import * as _ from 'lodash-es';

@Injectable({
  providedIn: 'root'
})
export class AdminWorkapceService {
  constructor(private httpService: HttpService) { }

  async createdSessinBySessionManager(obj:any) {
    let params = obj.order ? ('&order=' + obj.order + '&sort_by=' + obj.sort_by) : ''
    const config = {
          url: urlConstants.API_URLS.CREATED_SESSION_BY_SESSION_MANAGER + obj.page +  '&limit=' + obj?.limit + params+ '&search=' + btoa(obj?.searchText),
        };
    try {
      let result = await this.httpService.get(config);
      result = _.get(result, 'result');
      return result;
    }
    catch (error) {
      return false
    }
  }
}
