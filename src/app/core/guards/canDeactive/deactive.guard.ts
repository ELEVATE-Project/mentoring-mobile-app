import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanDeactivate,
  RouterStateSnapshot
} from "@angular/router";
import { Observable } from "rxjs";

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
    return component.canPageLeave ? component.canPageLeave() : true;
  }
}
