import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { localKeys } from '../constants/localStorage.keys';
import { User } from '../interface/user';
import { LocalStorageService } from './localstorage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public userSubject: BehaviorSubject<User>;
  public user: Observable<User>;
  authState = new BehaviorSubject(false);
  constructor(
    private localStorage: LocalStorageService) {
    this.userSubject = new BehaviorSubject<User>(null);
    this.user = this.userSubject.asObservable();
  }

  public getUserValue() {
    this.localStorage
      .getLocalData(localKeys.USER_DETAILS)
      .then((data) => {
        if (data) {
          let userDetail = JSON.parse(data);
          this.userSubject.next(userDetail);
          this.authState.next(true);
        }
        else{
          this.authState.next(false);
        }
      })
      .catch((error) => {});
  }

  isAuthenticated() {
    return this.authState.value;
  }
}
