import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanDeactivate,
  RouterStateSnapshot
} from "@angular/router";
import { Observable } from "rxjs";
import { CommonRoutes } from 'src/global.routes';

export interface isDeactivatable {
  canPageLeave: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CanLeavePageGuard implements CanDeactivate<isDeactivatable> {
  canDeactivate(
    component: isDeactivatable,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    if(nextState.url === `/${CommonRoutes.AUTH}/${CommonRoutes.LOGIN}`){return true}
    return component.canPageLeave ? component.canPageLeave() : true;
  }
}
