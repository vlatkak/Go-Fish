import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';

export interface CanDeactivateRoute {
  confirmForReroute() :  Promise<boolean>;
}

@Injectable({ providedIn: 'root' })
export class DeactivateGuard implements CanDeactivate<CanDeactivateRoute> {
  canDeactivate(component: CanDeactivateRoute) {
    return component.confirmForReroute ? component.confirmForReroute() : true;
  }
}
