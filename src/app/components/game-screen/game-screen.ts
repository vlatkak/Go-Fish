import { Component } from '@angular/core';
import {CARD_RANKS, RECIEVED_TYPE} from "../../constants/constants"
import {CARD_SUITS} from '../../constants/constants';
import {CARD_UI_DIMENSIONS} from '../../constants/constants';
import {GAME_STATES} from '../../constants/constants';
import {NgForOf, NgStyle} from '@angular/common';
import {Card} from '../../models/card.model';
import {Opponent} from '../../models/opponent.model';
import {Player} from '../../models/player.model';
import {CanDeactivate, RouterLink} from '@angular/router';
import {CanDeactivateRoute} from '../../routerGuard/routerGuardImplementation';


@Component({
  selector: 'app-game-screen',
  imports: [
    NgForOf,
    NgStyle,
    RouterLink
  ],
  templateUrl: './game-screen.html',
  styleUrl: './game-screen.css'
})
export class GameScreen implements CanDeactivateRoute{
  cardRankList :String[] = ["2", "3", "4", "5", "6", "7"];
  /*cardRankList :String[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10",
    CARD_RANKS.JACK, CARD_RANKS.QUEEN, CARD_RANKS.KING, CARD_RANKS.ACE];*/
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
  playerCardButtonClickable : boolean = true;
  whoseTurnText = "PLAYER'S TURN"
  infoText = "...";

  secondsElapsed = 0;
  timerDisplayString = "00:00:00"

  ngOnInit() {

    //Initializing values
    this.prepareCardDeck()
    this.player = new Player(this.dealCards());
    this.opponent = new Opponent(this.dealCards());
    this.player.checkIfSetComplete()
    this.opponent.checkIfSetComplete()

    setInterval(() => this.updateTimer(), 1000)

    //Game loop
    this.gameLoop().then(r => console.log("GAME END"))
  }

  async gameLoop() {
    if (this.player.cardHand.length == 0 && this.opponent.cardHand.length == 0) {
      this.gameStateImage = GAME_STATES.IDLE
      return
    }
    if (this.playersTurn) {
      console.log("PLAYERS TURN")
      this.gameStateImage = GAME_STATES.IDLE
      this.whoseTurnText = "PLAYER'S TURN"
      this.opponent.cardsAskedForMemory=[]

      if (this.player.cardHand.length == 0) {
        this.gameStateImage = GAME_STATES.PLAYER_DRAWS
        console.log("Player out of cards. Pulling from deck.");
        let pulledCard = this.player.pullFromDeck(this.cardDeck);
        if (pulledCard !== undefined) {
          this.player.cardHand.push(pulledCard);
        }
      }

      return
    } else {
      this.playerCardButtonClickable = false;
      console.log("OPPONENTS TURN")
      this.gameStateImage = GAME_STATES.IDLE
      this.whoseTurnText = "OPPONENT'S TURN"

      await this.opponentAskPlayerForCard()
      this.infoText="..."

      await this.gameLoop()
    }
  }

  async askOpponentForCard(desiredRank: String): Promise<void> {
    this.playerCardButtonClickable = false;
    this.opponent.addToPlayersCardsMemory(desiredRank)

    this.infoText = "You asked for the rank " + desiredRank + ".";
    await this.waitFewSeconds()
    let receivedCards: Array<Card> = []
    let opponentsCards: Array<Card> = this.opponent.giveCards(desiredRank);

    if(opponentsCards.length == 0){
      let pulledCard = this.player.pullFromDeck(this.cardDeck)
      if(pulledCard !== undefined){
        this.gameStateImage = GAME_STATES.PLAYER_DRAWS
        receivedCards.push(pulledCard);
        if(pulledCard.rank==desiredRank){
          this.infoText = "You received your desired rank from the deck.";
          this.playersTurn = true;
          this.playerCardButtonClickable = true;
        }
        else{
          this.infoText = "You didn't receive your desired rank.";
          this.playersTurn = false;
        }
      }
    }
    else{
      receivedCards = opponentsCards
      this.gameStateImage = GAME_STATES.OPPONENT_GIVES
      this.infoText = "You received "+receivedCards.length+" card(s) from the opponent.";
      this.playersTurn = true;
      this.playerCardButtonClickable = true;
    }
    this.player.receiveCards(receivedCards)
    await this.waitFewSeconds()

    if(this.player.checkIfSetComplete(receivedCards[0].rank)){
      console.log("Successful check for completed set")
      this.infoText = "You've completed a set of cards."
      await this.waitFewSeconds()
    }
  }

  async onCardButtonClick(rank: String) {
    await this.askOpponentForCard(rank)
    this.infoText="..."
    await this.gameLoop()
  }

  async opponentAskPlayerForCard(): Promise<void> {
    let chosenRank: String = this.opponent.askForCard(this.cardDeck)
    this.opponent.addToCardsAskedForMemory(chosenRank)
    this.infoText = "Opponent asked for the rank " + chosenRank + ".";
    await this.waitFewSeconds()
    let playersCards : Array<Card> = this.player.giveCards(chosenRank)
    let receivedCards: Array<Card> = []

    if(playersCards.length == 0){
      let pulledCard = this.opponent.pullFromDeck(this.cardDeck)
      if(pulledCard !== undefined) {
        this.gameStateImage = GAME_STATES.OPPONENT_DRAWS
        receivedCards.push(pulledCard);
        if (pulledCard.rank == chosenRank) {
          this.infoText = "Opponent received his desired rank from the deck.";
        } else {
          this.infoText = "Opponent didn't receive his desired rank.";
          this.playersTurn = true;
          this.playerCardButtonClickable = true;
        }
      }
    }
    else{
      receivedCards = playersCards
      this.gameStateImage = GAME_STATES.PLAYER_GIVES
      this.infoText = "Opponent received "+receivedCards.length+" card(s) from you.";
    }
    this.opponent.receiveCards(receivedCards)
    await this.waitFewSeconds()

    if(this.opponent.checkIfSetComplete(receivedCards[0].rank)){
      this.infoText = "Opponent completed a set of cards."
      this.gameStateImage = GAME_STATES.OPPONENT_GOT_SET
      await this.waitFewSeconds()
    }
  }

  setCardButtonMargins(whoseCards: String): string{
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

  setCardButtonSprite(card: Card): string{
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
    for(let i=0; i<3; i++){
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
    return new Promise(resolve => {
      // Get the modal element
      const myModal = document.getElementById('confirmExit')!;
      const confirmExit = new (window as any).bootstrap.Modal(myModal);

      // Hook up buttons
      myModal.querySelector('#exit')?.addEventListener('click', () => {
        confirmExit.hide();
        resolve(true); // allow navigation
      });

      myModal.querySelector('#dont_exit')?.addEventListener('click', () => {
        confirmExit.hide();
        resolve(false); // stay on page
        history.pushState(null, '', window.location.href);
      });

      // Show modal
      confirmExit.show();
    })
  }
}
