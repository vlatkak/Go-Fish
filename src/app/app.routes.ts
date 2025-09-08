import { Routes } from '@angular/router';
import {StartScreen} from './components/start-screen/start-screen';
import {GameScreen} from './components/game-screen/game-screen';
import {PreventRerouting} from './routerGuard/routerGuard';
import {EndScreen} from './components/end-screen/end-screen';

export const routes: Routes = [
  {path: '', component: StartScreen},
  {path: 'game', component: GameScreen, canDeactivate: [PreventRerouting]},
  {path: 'end/:pPoints/:oPoints/:time', component: EndScreen},
];
