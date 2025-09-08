import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import {GameScreen} from '../components/game-screen/game-screen';

@Injectable({ providedIn: 'root' })
export class PreventRerouting implements CanDeactivate<GameScreen> {
  canDeactivate(component: GameScreen) {
    return component.confirmForReroute ? component.confirmForReroute() : true;
  }
}
