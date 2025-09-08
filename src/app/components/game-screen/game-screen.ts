import {Component, HostListener} from '@angular/core';
import {CARD_SUITS} from '../../constants/constants';
import {CARD_RANKS} from '../../constants/constants';
import {CARD_UI_DIMENSIONS} from '../../constants/constants';
import {IDLE_STATE} from '../../constants/constants';
import {GAME_PARTICIPANT_TITLE} from '../../constants/constants';
import {NgStyle} from '@angular/common';
import {Card} from '../../model/card.model';
import {Opponent} from '../../model/opponent.model';
import {Player} from '../../model/player.model';
import {Router} from '@angular/router';
import {GameParticipant} from '../../model/game-participant.model';
import {MusicService} from '../../services/music-service';
import {Game} from '../../model/game.model';

declare var bootstrap: any;

@Component({
  selector: 'app-game-screen',
  imports: [
    NgStyle,
  ],
  templateUrl: './game-screen.html',
  styleUrl: './game-screen.css'
})
export class GameScreen{
  game!: Game;

  cardRankList :String[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10",
    CARD_RANKS.JACK, CARD_RANKS.QUEEN, CARD_RANKS.KING, CARD_RANKS.ACE];
  cardSuitList :String[] = [CARD_SUITS.CLUBS, CARD_SUITS.SPADES,
    CARD_SUITS.DIAMONDS, CARD_SUITS.HEARTS];

  cardDeck:Array<Card> = [];
  player! : Player;
  opponent! : Opponent;

  cardWidthStr: String = String(CARD_UI_DIMENSIONS.CARD_WIDTH)+"px"

  timerDisplayString: String = "00:00:00"

  constructor(private router: Router, private musicService: MusicService) { }

  ngOnInit() {
    this.musicService.playMusic()
    if(localStorage.getItem("refreshed")){
      document.addEventListener("click", ()=> this.musicService.playMusic())
      document.removeEventListener("click", ()=> this.musicService.playMusic())
      localStorage.removeItem("refreshed");
    }

    //Initializing values
    this.prepareCardDeck()
    this.player = new Player(this.dealCards());
    this.opponent = new Opponent(this.dealCards());
    this.player.checkIfSetComplete()
    this.opponent.checkIfSetComplete()

    this.game = new Game(this.router, this.cardDeck, this.opponent, this.player)

    setInterval(() => this.updateTimer(), 1000)

    //Game loop
    this.game.gameLoop()
  }

  ngOnDestroy(){
    this.game.audio.muted = true;
  }

  // CARD CLICK METHOD -----------------------------------------------------------------------------------------------

  async onCardElementClick(rank: String) {
    this.opponent.addToPlayersCardsMemory(rank)
    await this.game.askAndReceiveCards(this.player, rank)
    this.game.infoText="..."
    await this.game.gameLoop()
  }

  // PRESENTATION METHODS --------------------------------------------------------------------------------------------

  setCardElementMargins(participant: GameParticipant, containerId: string): string{
    let cardHand: Array<Card> = participant.cardHand

    let cardContainer = document.getElementById(containerId)
    let cardContainerWidth = cardContainer? cardContainer.offsetWidth : 0

    let maxCardNumber : number = Math.floor(cardContainerWidth/CARD_UI_DIMENSIONS.CARD_WIDTH);

    if(cardHand.length >= maxCardNumber){
      let adjustedMargins: number =
        Math.floor((cardContainerWidth - cardHand.length * CARD_UI_DIMENSIONS.CARD_WIDTH)
          /(cardHand.length-1))
      return String(adjustedMargins)+"px";
    }
    return "10px";
  }

  setCardElementSprite(card: Card): string{
    let rankImageString
    let suitImageString
    if(isNaN(Number(card.rank))){
      rankImageString = card.rank+".webp"
    }
    else{
      rankImageString = "n"+card.rank+".webp"
    }
    suitImageString = card.suit+".webp"
    let url = "url('../../assets/ranks/"+rankImageString+"'), " +
      "url('../../assets/suits/"+suitImageString+"'), " +
      "url('assets/card_base.webp')"
    return url
  }

  updateTimer(): void{
    this.game.secondsElapsed = Number(this.game.secondsElapsed) + 1
    let seconds = Math.floor(Number(this.game.secondsElapsed) % 3600 % 60);
    let minutes = Math.floor(Number(this.game.secondsElapsed) % 3600 / 60);
    let hours = Math.floor(Number(this.game.secondsElapsed) / 3600)

    let hoursStr = "0"+String(hours)
    let minutesStr = "0"+String(minutes)
    let secondsStr = "0"+String(seconds)

    this.timerDisplayString = hoursStr.slice(-2)+ ":" +minutesStr.slice(-2)+ ":" +secondsStr.slice(-2)
  }

  // VALUE INITIALIZATION METHODS ------------------------------------------------------------------------------------

  prepareCardDeck(): void{
    for(let rank of this.cardRankList){
      for(let suit of this.cardSuitList){
        this.cardDeck.push(new Card(rank, suit));
      }
    }
    //Shuffling the deck:
    this.cardDeck.sort(() => Math.random() - 0.5);
  }

  dealCards(): Array<Card> {
    let dealtArray : Array<Card> = [];
    for(let i=0; i<7; i++){
      dealtArray.push(<Card>this.cardDeck.pop());
    }
    return dealtArray;
  }

  // ROUTE GUARD METHOD -----------------------------------------------------------------------------------------------

  confirmForReroute(): Promise<boolean> {
    if(this.game.gameEnded){
      return new Promise(resolve => resolve(true))
    }

    return new Promise(resolve => {
      const confirmExitModal = new bootstrap.Modal(document.getElementById('confirmExit'));
      confirmExitModal.show();

      document.getElementById("exit")?.addEventListener('click', () => {
        confirmExitModal.hide();
        this.game.gameExited=true;
        resolve(true);
      });

      document.getElementById("dont_exit")?.addEventListener('click', () => {
        confirmExitModal.hide();
        history.pushState(null, '', window.location.href);
        resolve(false);
      });
    })
  }

  // LISTENER FOR REFRESH ---------------------------------------------------------------------------------------------

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: BeforeUnloadEvent) {
    $event.preventDefault();
    localStorage.setItem("refreshed", "true")
  }

}
