import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Router } from '@angular/router';
import { UserService } from '../services/user/user.service';
import { ToastService, UtilService } from '../services';

@Injectable({
  providedIn: 'root'
})
export class PrivateGuard implements CanActivate {
   constructor(private userService:UserService,private router: Router, private utilService: UtilService, private toastService: ToastService){}
  async canActivate(): Promise<boolean> {
    try {
      const token = await this.userService.getUserValue();
      if (token) {
        this.utilService?.alertClose();
        return true;
      }
      this.redirectToOrigin();
      return false;
    } catch (err) {
      this.redirectToOrigin();
      return false;
    }
  }

  private redirectToOrigin(): void {
    location.href = window.location.origin;
  }
}