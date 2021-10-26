import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Router } from '@angular/router';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { LocalStorageService } from 'src/app/core/services';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private localStorage: LocalStorageService) { }
  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<any> {
    var accessToken: any = await this.localStorage.getLocalData(localKeys.USER_DETAILS);
    if (accessToken?.access_token) {
      return true
    } else {
      alert("You are currently not logged in, please provide Login!")
      this.router.navigate(["/auth/login"]);
      return false
    }
  }
}