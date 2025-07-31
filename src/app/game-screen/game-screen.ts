import { Component } from '@angular/core';
import {CARD_RANKS} from "../constants/constants"
import {CARD_SUITS} from '../constants/constants';
import {TURNS} from '../constants/constants';
import {NgForOf} from '@angular/common';
import {Card} from '../models/card.model';
import {Opponent} from '../models/opponent.model';
import {Player} from '../models/player.model';

@Component({
  selector: 'app-game-screen',
  imports: [
    NgForOf
  ],
  templateUrl: './game-screen.html',
  styleUrl: './game-screen.css'
})
export class GameScreen {
  cardRankList :String[] = ["2", "3", "4", "5", "6", "7"];
  /*cardRankList :String[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10",
    CARD_RANKS.JACK, CARD_RANKS.QUEEN, CARD_RANKS.KING, CARD_RANKS.ACE];*/
  cardSuitList :String[] = [CARD_SUITS.CLUBS, CARD_SUITS.SPADES,
    CARD_SUITS.DIAMONDS, CARD_SUITS.HEARTS];

  cardDeck:Array<Card> = [];
  player! : Player;
  opponent! : Opponent;

  playersTurn : boolean = true;
  playerCardButtonClickable : boolean = true;
  whoseTurnText = "PLAYER'S TURN"
  infoText = "";

  ngOnInit() {
    //Initializing values
    this.prepareCardDeck()
    this.player = new Player(this.dealCards());
    this.opponent = new Opponent(this.dealCards());
    this.player.checkIfSetComplete()
    this.opponent.checkIfSetComplete()

    //Game loop
    this.gameLoop()
  }

  async gameLoop() {
    if (this.player.cardHand.length == 0 && this.opponent.cardHand.length == 0) {
      console.log("GAME END")
      return
    }
    if (this.playersTurn) {
      console.log("PLAYERS TURN")
      this.whoseTurnText = "PLAYER'S TURN"

      if (this.player.cardHand.length == 0) {
        console.log("Player out of cards. Pulling from deck.");
        let pulledCard = this.player.pullFromDeck(this.cardDeck);
        if (pulledCard !== undefined) {
          this.player.cardHand.push(pulledCard);
        }
      }
      if(this.opponent.cardHand.length == 0){
        console.log("Opponent out of cards. Pulling from deck.");
        let pulledCard = this.player.pullFromDeck(this.cardDeck);
        if (pulledCard !== undefined) {
          this.player.cardHand.push(pulledCard);
        }
      }
    } else {
      this.playerCardButtonClickable = false;
      console.log("OPPONENTS TURN")
      this.whoseTurnText = "OPPONENT'S TURN"

      this.opponentAskPlayerForCard()
    }
    if (this.player.cardHand.length > 0 || this.opponent.cardHand.length > 0) {
      setTimeout(() => this.gameLoop(), 3000)
    }
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
    /*for(let i=0; i<7; i++){
      dealtArray.push(<Card>this.cardDeck.pop());
    }*/
    return dealtArray;
  }

  async askOpponentForCard(rank: String): Promise<void> {
    this.playerCardButtonClickable = false;
    this.opponent.addToMemory(rank)
    this.infoText = "You asked for a " + rank + ".";
    await this.waitFewSeconds()
    let receivedCards: Array<Card> = this.opponent.giveCards(rank);
    this.infoText = "You received " + receivedCards.length + " cards from opponent.";
    console.log("Number of cards in deck before " + this.cardDeck.length);
    this.playersTurn = this.player.receiveCards(receivedCards, this.cardDeck, rank);
    if(this.playersTurn){
      this.playerCardButtonClickable = true;
    }
    console.log("Number of cards in deck after " + this.cardDeck.length);
  }

  async opponentAskPlayerForCard(): Promise<void> {
    let chosenRank: String = this.opponent.askForCard(this.cardDeck)
    this.infoText = "Opponent asked for a " + chosenRank + ".";
    await this.waitFewSeconds()
    let receivedCards: Array<Card> = this.player.giveCards(chosenRank)
    this.infoText = "You give the opponent " + receivedCards.length + " cards.";
    let opponentJustReceived = this.opponent.receiveCards(receivedCards, this.cardDeck, chosenRank);
    if (!opponentJustReceived) {
      this.playersTurn = true;
      this.playerCardButtonClickable = true;
    }
  }

  async waitFewSeconds() {
    let timeToWait = Math.random() * 3000 + 1000;
    return new Promise(resolve => setTimeout(resolve, timeToWait));
  }
}
