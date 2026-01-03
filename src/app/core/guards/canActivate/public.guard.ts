import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { UserService } from '../../services/user/user.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PublicGuard implements CanActivate {
  constructor(private userService:UserService,private router: Router){}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    return this.userService.getUserValue().then((result) => {
      if (result) {
        return false;
      } else if(environment['isAuthBypassed']) {
        console.log("************** 21 public gausrd ");
          // Remove after testing
        this.router.navigate(['/mentoring/tabs/home']);
        return false;
      }
      else {
        return true;
      }
    }).catch(error => {
        return true;
    });
  
  }
  
}
