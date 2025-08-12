import { Component } from '@angular/core';
import {CARD_RANKS, RECIEVED_TYPE} from "../constants/constants"
import {CARD_SUITS} from '../constants/constants';
import {CARD_UI_DIMENSIONS} from '../constants/constants';
import {NgForOf, NgStyle} from '@angular/common';
import {Card} from '../models/card.model';
import {Opponent} from '../models/opponent.model';
import {Player} from '../models/player.model';

@Component({
  selector: 'app-game-screen',
  imports: [
    NgForOf,
    NgStyle
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

  cardContainerWidth: number = (CARD_UI_DIMENSIONS.CARD_WIDTH+10) * CARD_UI_DIMENSIONS.CARDS_PER_CONTAINER
  cardContainerWidthStr: string = String(this.cardContainerWidth)+"px"
  cardWidthStr: string = String(CARD_UI_DIMENSIONS.CARD_WIDTH)+"px"

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
    this.gameLoop().then(r => console.log("GAME END"))
  }

  async gameLoop() {
    if (this.player.cardHand.length == 0 && this.opponent.cardHand.length == 0) {
      return
    }
    if (this.playersTurn) {
      console.log("PLAYERS TURN")
      this.whoseTurnText = "PLAYER'S TURN"
      this.opponent.cardsAskedForMemory=[]

      if (this.player.cardHand.length == 0) {
        console.log("Player out of cards. Pulling from deck.");
        let pulledCard = this.player.pullFromDeck(this.cardDeck);
        if (pulledCard !== undefined) {
          this.player.cardHand.push(pulledCard);
        }
      }

    } else {
      this.playerCardButtonClickable = false;
      console.log("OPPONENTS TURN")
      this.whoseTurnText = "OPPONENT'S TURN"

      await this.opponentAskPlayerForCard()
    }

    if (this.player.cardHand.length > 0 || this.opponent.cardHand.length > 0) {
      setTimeout(() => this.gameLoop(), 3000)
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
      switch (card.rank){
        case(CARD_RANKS.KING):
          rankImageString = "king.png"
          break;
        case(CARD_RANKS.QUEEN):
          rankImageString = "queen.png"
          break;
        case(CARD_RANKS.JACK):
          rankImageString = "jack.png"
          break;
        case(CARD_RANKS.ACE):
          rankImageString = "ace.png"
          break;
      }
    }
    else{
      rankImageString = "n"+card.rank+".png"
    }
    switch(card.suit){
      case(CARD_SUITS.CLUBS):
        suitImageString = "clubs.png"
        break;
      case(CARD_SUITS.HEARTS):
        suitImageString = "heart.png"
        break;
      case(CARD_SUITS.DIAMONDS):
        suitImageString = "diamond.png"
        break;
      case(CARD_SUITS.SPADES):
        suitImageString = "spades.png"
        break;
    }
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
    for(let i=0; i<10; i++){
      dealtArray.push(<Card>this.cardDeck.pop());
    }
    /*for(let i=0; i<7; i++){
      dealtArray.push(<Card>this.cardDeck.pop());
    }*/
    return dealtArray;
  }

  async askOpponentForCard(rank: String): Promise<void> {
    this.playerCardButtonClickable = false;
    this.opponent.addToPlayerCardsMemory(rank)

    this.infoText = "You asked for a " + rank + ".";
    await this.waitFewSeconds()
    let receivedCards: Array<Card> = this.opponent.giveCards(rank);
    console.log("Number of cards in deck before " + this.cardDeck.length);
    switch(this.player.receiveCards(receivedCards, this.cardDeck, rank)){
      case RECIEVED_TYPE.CARD_FROM_PLAYER:
        this.playersTurn = true;
        this.playerCardButtonClickable = true;
        this.infoText = "You received "+receivedCards.length+" card from the opponent.";
        break;
      case RECIEVED_TYPE.CARD_FROM_DECK:
        this.playersTurn = true;
        this.playerCardButtonClickable = true;
        this.infoText = "You received your desired rank from the deck, not the opponent.";
        break;
      default:
        this.playersTurn = false;
        this.infoText = "You didn't receive your desired rank.";
    }

    console.log("Number of cards in deck after " + this.cardDeck.length);
  }

  async opponentAskPlayerForCard(): Promise<void> {
    let chosenRank: String = this.opponent.askForCard(this.cardDeck)
    this.opponent.addToCardsAskedForMemory(chosenRank)
    this.infoText = "Opponent asked for a " + chosenRank + ".";
    await this.waitFewSeconds()
    let receivedCards: Array<Card> = this.player.giveCards(chosenRank)
    switch(this.opponent.receiveCards(receivedCards, this.cardDeck, chosenRank)){
      case RECIEVED_TYPE.CARD_FROM_PLAYER:
        this.infoText = "Opponent received "+receivedCards.length+" card from you.";
        break;
      case RECIEVED_TYPE.CARD_FROM_DECK:
        this.infoText = "Opponent received his desired rank from the deck, not you";
        break;
      default:
        this.playersTurn = true;
        this.playerCardButtonClickable = true;
        this.infoText = "Opponent didn't receive his desired rank.";
    }
  }

  async waitFewSeconds() {
    let timeToWait = Math.random() * 3000 + 1000;
    return new Promise(resolve => setTimeout(resolve, timeToWait));
  }

  protected readonly CARD_UI_DIMENSIONS = CARD_UI_DIMENSIONS;
}
