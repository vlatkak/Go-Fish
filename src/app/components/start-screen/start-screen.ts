import { Component } from '@angular/core';
import {NavigationEnd, NavigationStart, Router, RouterLink} from '@angular/router';
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

  subscription! : SubscriptionLike;

  constructor(private router: Router, private musicService: MusicService) {}

  ngOnInit() {
    this.musicService.stopMusic()

    this.subscription = this.router.events.subscribe(e => {
      if(e instanceof NavigationStart && e.navigationTrigger === 'popstate') {
        this.router.getCurrentNavigation()?.abort();
      }
    })
  }

  ngOnDestroy() {
    this.subscription.unsubscribe()
  }


  playBackgroundMusic(){
    this.musicService.playMusic()
  }
}
