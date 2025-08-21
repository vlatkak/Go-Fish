import { Routes } from '@angular/router';
import {StartScreen} from './components/start-screen/start-screen';
import {GameScreen} from './components/game-screen/game-screen';
import {DeactivateGuard} from './routerGuard/routerGuardImplementation';

export const routes: Routes = [
  {path: '', component: StartScreen},
  {path: 'game', component: GameScreen, canDeactivate: [DeactivateGuard]},
];
