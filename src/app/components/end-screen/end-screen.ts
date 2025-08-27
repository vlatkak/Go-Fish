import { Component } from '@angular/core';
import {Router, ActivatedRoute, RouterLink, NavigationStart} from '@angular/router';
import {PlatformLocation} from '@angular/common';
import {SubscriptionLike} from 'rxjs';

@Component({
  selector: 'app-end-screen',
  imports: [
    RouterLink
  ],
  templateUrl: './end-screen.html',
  styleUrl: './end-screen.css'
})
export class EndScreen {
  subscription!: SubscriptionLike;

  constructor(private router: Router, private route: ActivatedRoute, private platformLocation: PlatformLocation) { }
  playersPoints = 0
  opponentsPoints = 0
  secondsElapsed = 0
  timeString = ""
  whoWonText = "YOU WIN!"

  ngOnInit() {
    this.subscription = this.router.events.subscribe(e => {
      if(e instanceof NavigationStart && e.navigationTrigger === 'popstate') {
        this.router.getCurrentNavigation()?.abort();
      }
    })

    this.playersPoints = Number(this.route.snapshot.params['pPoints'])
    this.opponentsPoints = Number(this.route.snapshot.params['oPoints'])
    this.secondsElapsed = this.route.snapshot.params['time']

    if(this.opponentsPoints>this.playersPoints){
      this.whoWonText="YOU LOSE."
    }
    else if(this.opponentsPoints==this.playersPoints){
      this.whoWonText="IT'S A TIE!"
    }

    let seconds = Math.floor(this.secondsElapsed % 3600 % 60);
    let minutes = Math.floor(this.secondsElapsed % 3600 / 60);
    let hours = Math.floor(this.secondsElapsed / 3600)

    this.timeString=hours+"h, "+minutes+"min, "+seconds+"s"
  }

  ngOnDestroy() {
    this.subscription.unsubscribe()
  }
}
