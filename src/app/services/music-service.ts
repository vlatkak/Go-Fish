import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MusicService {
  private music: HTMLAudioElement;

  constructor() {
    this.music = new Audio('assets/audio/bg-music.mp3');
    this.music.loop = true;
    this.music.volume = 0.3;
  }

  playMusic():void{
    this.music.play()
  }

  stopMusic():void{
    this.music.pause();
    this.music.currentTime = 0;
  }
}
