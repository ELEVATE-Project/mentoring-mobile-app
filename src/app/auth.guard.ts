import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Router } from '@angular/router';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { AuthService, LocalStorageService } from 'src/app/core/services';
import { CommonRoutes } from 'src/global.routes';
import * as _ from 'lodash-es';
import { NavController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private localStorage: LocalStorageService,
    private authService:AuthService,private navCtrl:NavController) { }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
      console.log(this.authService.isAuthenticated());
    if (this.authService.isAuthenticated()) {
      return true;
    }
    else {
      this.navCtrl.navigateRoot([CommonRoutes.AUTH])
      return false;
    }
  }
}