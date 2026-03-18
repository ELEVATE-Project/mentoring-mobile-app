import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { LocalStorageService } from 'src/app/core/services';
import { CommonRoutes } from 'src/global.routes';

@Injectable({
  providedIn: 'root',
})
export class ChatConfigGuard implements CanActivate {
  constructor(
    private localStorage: LocalStorageService,
    private router: Router
  ) {}

  async canActivate(): Promise<boolean | UrlTree> {
    const chatConfig = await this.localStorage.getLocalData(
      localKeys.CHAT_CONFIG
    );

    if (chatConfig === true || chatConfig === 'true') {
      return true;
    }

    return this.router.parseUrl(`/${CommonRoutes.TABS}/${CommonRoutes.HOME}`);
  }
}
