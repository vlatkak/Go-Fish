import { Component } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-start-screen',
  imports: [],
  templateUrl: './start-screen.html',
  styleUrl: './start-screen.css'
})
export class StartScreen {

  constructor(private router: Router) { }

  startGame(){
    this.router.navigate(['/game']);
  }
}
