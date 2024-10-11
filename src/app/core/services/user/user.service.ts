import { Injectable } from '@angular/core';
import { localKeys } from '../../constants/localStorage.keys';
import { LocalStorageService } from '../localstorage.service';
import * as _ from 'lodash-es';
import jwt_decode from "jwt-decode";
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  token;
  baseUrl:any;
  userEvent = new Subject<any>();
  userEventEmitted$ = this.userEvent.asObservable();
  constructor(
    private localStorage: LocalStorageService,
    ) {}

  async getUserValue() {
    return this.localStorage
      .getLocalData(localKeys.TOKEN)
      .then((data: any) => {
        this.token=data;
        return data;
      })
      .catch((error) => { });
  }

  validateToken(token){
    const tokenDecoded: any = jwt_decode(token);
    const tokenExpiryTime = new Date(tokenDecoded.exp * 1000); 
    const currentTime = new Date(); 
    return currentTime < tokenExpiryTime;
  }
  
}
