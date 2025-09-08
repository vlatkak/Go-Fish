import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {GameScreen} from './components/game-screen/game-screen';
import {MusicService} from './services/music-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Go-Fish');
}
