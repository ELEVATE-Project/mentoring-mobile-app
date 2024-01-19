// permission.guard.ts

import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { PermissionService } from '../../services/permission/permission.service';
import { UtilService } from '../../services';
import { TranslateService } from '@ngx-translate/core';
import { AlertController } from '@ionic/angular';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class PermissionGuard implements CanActivate {
  isMobile: boolean;
  constructor(
    private permissionService: PermissionService, 
    private utilService: UtilService,
    private translate: TranslateService,
    private alert: AlertController,
    private _location: Location,
    ) {
      this.isMobile = utilService.isMobile()
    }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const permissions = route.data.permissions ? route.data.permissions : {};
    (permissions && this.isMobile) ? this.portalOnlyAlert(): '';
    return this.permissionService.hasPermission(permissions);
  }

  async portalOnlyAlert(){
    let texts: any;
        this.translate
          .get(['OK', 'PORTAL_ONLY_TOAST_MESSAGE'])
          .subscribe((text) => {
            texts = text;
          });
        const alert = await this.alert.create({
          message: texts['PORTAL_ONLY_TOAST_MESSAGE'],
          buttons: [
            {
              text: texts['OK'],
              role: 'cancel',
              cssClass: 'alert-button-red',
              handler: () => {
              },
            },
          ],
          backdropDismiss: false
        });
        await alert.present();
        let data = await alert.onDidDismiss();
        if (data.role == 'cancel') {
          this._location.back()
        }
        return false;
  }
}
