import { Component } from '@angular/core';
import {CARD_RANKS, RECEIVED_TYPE} from "../../constants/constants"
import {CARD_SUITS} from '../../constants/constants';
import {CARD_UI_DIMENSIONS} from '../../constants/constants';
import {GAME_STATES} from '../../constants/constants';
import {NgForOf, NgStyle} from '@angular/common';
import {Card} from '../../models/card.model';
import {Opponent} from '../../models/opponent.model';
import {Player} from '../../models/player.model';
import {CanDeactivate, Router} from '@angular/router';
import {CanDeactivateRoute} from '../../routerGuard/routerGuardImplementation';
import {GameParticipant} from '../../models/game-participant.model';

@Component({
  selector: 'app-game-screen',
  imports: [
    NgForOf,
    NgStyle,
  ],
  templateUrl: './game-screen.html',
  styleUrl: './game-screen.css'
})
export class GameScreen{

  /*cardRankList :String[] = ["2", "3", "4", "5", "6", "7"];*/
  cardRankList :String[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10",
    CARD_RANKS.JACK, CARD_RANKS.QUEEN, CARD_RANKS.KING, CARD_RANKS.ACE];
  cardSuitList :String[] = [CARD_SUITS.CLUBS, CARD_SUITS.SPADES,
    CARD_SUITS.DIAMONDS, CARD_SUITS.HEARTS];

  cardContainerWidth: number = (CARD_UI_DIMENSIONS.CARD_WIDTH+10) * CARD_UI_DIMENSIONS.CARDS_PER_CONTAINER
  cardContainerWidthStr: string = String(this.cardContainerWidth)+"px"
  cardWidthStr: string = String(CARD_UI_DIMENSIONS.CARD_WIDTH)+"px"
  gameStateImage: string = GAME_STATES.IDLE

  cardDeck:Array<Card> = [];
  player! : Player;
  opponent! : Opponent;

  playersTurn : boolean = true;
  playerCardElementClickable : boolean = true;
  whoseTurnText = "PLAYER'S TURN"
  gameEnded = false;
  gameExited = false;
  infoText = "...";

  secondsElapsed = 0;
  timerDisplayString = "00:00:00"

  audio = new Audio();

  constructor(private router: Router) { }

  ngOnInit() {

    //Initializing values
    this.prepareCardDeck()
    this.player = new Player(this.dealCards());
    this.opponent = new Opponent(this.dealCards());
    this.player.checkIfSetComplete()
    this.opponent.checkIfSetComplete()

    setInterval(() => this.updateTimer(), 1000)

    //Game loop
    this.gameLoop().then(r => console.log("end"))
  }

  ngOnDestroy(){
    this.audio.muted = true;
  }

  async gameLoop() {
    if(this.gameExited){
      return
    }
    if (this.player.cardHand.length == 0 && this.opponent.cardHand.length == 0) {
      this.gameStateImage = GAME_STATES.IDLE
      this.gameEnded=true
      this.router.navigate(['/end', this.player.completeSetNum, this.opponent.completeSetNum, this.secondsElapsed])
      return
    }
    if (this.playersTurn) {
      console.log("PLAYERS TURN")
      this.gameStateImage = GAME_STATES.IDLE
      this.whoseTurnText = "PLAYER'S TURN"
      this.opponent.cardsAskedForMemory=[]

      if (this.player.cardHand.length == 0) {
        this.infoText = "You ran out of cards, so you pulled one from the deck.";
        let pulledCard = this.player.pullFromDeck(this.cardDeck);
        if (pulledCard !== undefined) {
          this.player.cardHand.push(pulledCard);
        }
      }

      return
    } else {
      this.playerCardElementClickable = false;
      console.log("OPPONENTS TURN")
      this.gameStateImage = GAME_STATES.IDLE
      this.whoseTurnText = "OPPONENT'S TURN"

      let chosenRank: String = this.opponent.askForCard(this.cardDeck)
      this.opponent.addToCardsAskedForMemory(chosenRank)
      await this.askAndReceiveCards(this.opponent, chosenRank)
      this.infoText="..."

      await this.gameLoop()
    }
  }

  async askAndReceiveCards(participant: GameParticipant, desiredRank: String){
    let titleOfParticipant : String = ""
    let cardsReceivedFromOther : Array<Card> = []
    if(participant instanceof Opponent){
      titleOfParticipant = "Opponent"
    }
    else{
      titleOfParticipant = "You"
      this.playerCardElementClickable = false
    }

    this.infoText = titleOfParticipant+" asked for the rank " + desiredRank + ".";
    await this.waitFewSeconds()
    if(participant instanceof Opponent){
      cardsReceivedFromOther = this.player.giveCards(desiredRank)
    }
    else{
      cardsReceivedFromOther = this.opponent.giveCards(desiredRank)
    }
    let receivedCards: Array<Card> = []

    if(cardsReceivedFromOther.length==0){
      let pulledCard = participant.pullFromDeck(this.cardDeck)
      if(pulledCard !== undefined){
        this.gameStateImage = participant.sprites.drawingCard
        receivedCards.push(pulledCard);
        if(pulledCard.rank==desiredRank){
          this.infoText = titleOfParticipant+" received desired rank from the deck.";
          this.playAudio(participant.soundEffects.success)
        }
        else{
          this.infoText = titleOfParticipant+" didn't receive desired rank.";
          this.playAudio(participant.soundEffects.failure)
        }
      }
    }
    else{
      receivedCards = cardsReceivedFromOther
      this.gameStateImage = participant.sprites.receivingCard
      this.infoText = titleOfParticipant+" received "+receivedCards.length+" card(s).";
      if(receivedCards.length==0){
        this.playAudio(participant.soundEffects.failure)
      }
      else{
        this.playAudio(participant.soundEffects.success)
      }
    }
    participant.receiveCards(receivedCards)
    await this.waitFewSeconds()

    if(participant.checkIfSetComplete(receivedCards[0].rank)){
      this.gameStateImage = participant.sprites.collectedSet
      console.log("Successful check for completed set")
      this.infoText = titleOfParticipant+" completed a set of cards."
      this.playAudio(participant.soundEffects.completedSet)
      await this.waitFewSeconds()
    }

    if(receivedCards[0].rank==desiredRank){
      if(participant instanceof Opponent){
        this.playersTurn=false
        this.playerCardElementClickable=false
      }
      else{
        this.playersTurn=true
        this.playerCardElementClickable=true
      }
    }
    else{
      if(participant instanceof Opponent){
        this.playersTurn=true
        this.playerCardElementClickable=true
      }
      else{
        this.playersTurn=false
        this.playerCardElementClickable=false
      }
    }
  }

  async onCardElementClick(rank: String) {
    this.opponent.addToPlayersCardsMemory(rank)
    await this.askAndReceiveCards(this.player, rank)
    this.infoText="..."
    await this.gameLoop()
  }

  setCardElementMargins(whoseCards: String): string{
    let cardHand!: Array<Card>
    if(whoseCards == "P"){
      cardHand = this.player.cardHand
    }
    else{
      cardHand = this.opponent.cardHand
    }
    let spaceOccupiedByCards = cardHand.length * (CARD_UI_DIMENSIONS.CARD_WIDTH+10);
    if(spaceOccupiedByCards > this.cardContainerWidth){
      let adjustedMargins: number =
        Math.floor((cardHand.length * CARD_UI_DIMENSIONS.CARD_WIDTH - this.cardContainerWidth)
          /(cardHand.length-1))
      if(cardHand.length>CARD_UI_DIMENSIONS.CARDS_PER_CONTAINER){
        return "-"+String(adjustedMargins)+"px";
      }
    }
    return "10px";
  }

  setCardElementSprite(card: Card): string{
    let rankImageString
    let suitImageString
    if(isNaN(Number(card.rank))){
      rankImageString = card.rank+".png"
    }
    else{
      rankImageString = "n"+card.rank+".png"
    }
    suitImageString = card.suit+".png"
    let url = "url('../../assets/ranks/"+rankImageString+"'), " +
      "url('../../assets/suits/"+suitImageString+"'), " +
      "url('assets/card_base.png')"
    return url
  }

  prepareCardDeck(){
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

  async waitFewSeconds() {
    let timeToWait = Math.random() * 2000 + 2000;
    return new Promise(resolve => setTimeout(resolve, timeToWait));
  }

  updateTimer(){
    this.secondsElapsed ++
    let seconds = Math.floor(this.secondsElapsed % 3600 % 60);
    let minutes = Math.floor(this.secondsElapsed % 3600 / 60);
    let hours = Math.floor(this.secondsElapsed / 3600)

    let hoursStr = "0"+String(hours)
    let minutesStr = "0"+String(minutes)
    let secondsStr = "0"+String(seconds)

    this.timerDisplayString = hoursStr.slice(-2)+ ":" +minutesStr.slice(-2)+ ":" +secondsStr.slice(-2)
  }

  confirmForReroute(): Promise<boolean> {
    if(this.gameEnded){
      return new Promise(resolve => resolve(true))
    }

    return new Promise(resolve => {
      const myModal = document.getElementById('confirmExit')!;
      const confirmExit = new (window as any).bootstrap.Modal(myModal);

      myModal.querySelector('#exit')?.addEventListener('click', () => {
        confirmExit.hide();
        this.gameExited=true;
        resolve(true);
      });

      myModal.querySelector('#dont_exit')?.addEventListener('click', () => {
        confirmExit.hide();
        resolve(false);
        history.pushState(null, '', window.location.href);
      });

      confirmExit.show();
    })
  }

  playAudio(resource: string){
    this.audio.src = resource;
    this.audio.volume = 0.5;
    this.audio.load()
    this.audio.play()
  }
  //može se popraviti da ne reloada zvuk svaki put
}
