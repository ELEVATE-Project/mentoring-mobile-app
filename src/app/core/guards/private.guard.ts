import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { CommonRoutes } from 'src/global.routes';
import { UserService } from '../services/user/user.service';
import { UtilService } from '../services';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PrivateGuard implements CanActivate {
  constructor(private userService:UserService,private router: Router, private utilService: UtilService){}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    return this.userService.getUserValue().then((result) => {
      if (result) {
        this.utilService?.alertClose();
        return true;
      } else if(window['env']['isAuthBypassed']) {
        return true;
      } else {
        this.router.navigate([`/${CommonRoutes.AUTH}/${CommonRoutes.LANDING_PAGE}`]);
        return false;
      }
    }).catch(error => {
      this.router.navigate([`/${CommonRoutes.AUTH}/${CommonRoutes.LANDING_PAGE}`]);
        return false;
    });
  
  }
  
}
