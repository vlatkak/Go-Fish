import { Component } from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {Location} from '@angular/common';
import {MusicService} from '../../services/music-service';
import {SubscriptionLike} from 'rxjs';

@Component({
  selector: 'app-start-screen',
  imports: [
    RouterLink
  ],
  templateUrl: './start-screen.html',
  styleUrl: './start-screen.css',
})
export class StartScreen {

  constructor(private musicService: MusicService) {}

  ngOnInit() {
    this.musicService.stopMusic()

    history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', () => history.pushState(null, '', window.location.href));
  }

  ngOnDestroy() {
    window.removeEventListener('popstate', () => history.pushState(null, '', window.location.href));
  }

  playBackgroundMusic(){
    this.musicService.playMusic()
  }

}
