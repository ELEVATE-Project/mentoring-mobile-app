import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { CommonRoutes } from 'src/global.routes';
import { UtilService } from '../../services';
import { environment } from 'src/environments/environment';
import { UserService } from '../../services';

@Injectable({
  providedIn: 'root'
})
export class AllowPageAccess implements CanActivate {
  constructor(private router: Router){}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      
      if(window['env']['restictedPages'].includes(route.data.pageId)) {
        this.router.navigate(["/"]);
        return false
      }
      return true
  }
  
}
