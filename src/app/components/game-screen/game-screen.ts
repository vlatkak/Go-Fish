import { Component } from '@angular/core';
import {CARD_SUITS} from '../../constants/constants';
import {CARD_RANKS} from '../../constants/constants';
import {CARD_UI_DIMENSIONS} from '../../constants/constants';
import {IDLE_STATE} from '../../constants/constants';
import {GAME_PARTICIPANT_TITLE} from '../../constants/constants';
import {NgForOf, NgStyle} from '@angular/common';
import {Card} from '../../models/card.model';
import {Opponent} from '../../models/opponent.model';
import {Player} from '../../models/player.model';
import {Router} from '@angular/router';
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
  gameStateImage: string = IDLE_STATE

  cardDeck:Array<Card> = [];
  player! : Player;
  opponent! : Opponent;

  playersTurn : boolean = true;
  playerCardElementClickable : boolean = true;

  whoseTurnText = "PLAYER'S TURN"
  infoText = "...";
  secondsElapsed = 0;
  timerDisplayString = "00:00:00"

  audio = new Audio();

  gameEnded = false;
  gameExited = false;

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
    if(this.gameExited) return

    if (this.player.cardHand.length == 0 && this.opponent.cardHand.length == 0) {
      this.gameStateImage = IDLE_STATE
      this.gameEnded=true
      this.router.navigate(['/end', this.player.completeSetNum, this.opponent.completeSetNum, this.secondsElapsed])
      return
    }

    const currentParticipant: GameParticipant = this.playersTurn ? this.player : this.opponent
    const otherParticipant: GameParticipant = this.playersTurn ? this.opponent : this.player
    let titleOfParticipant : String = this.playersTurn ? GAME_PARTICIPANT_TITLE.PLAYER : GAME_PARTICIPANT_TITLE.OPPONENT

    this.gameStateImage = IDLE_STATE
    this.whoseTurnText = this.playersTurn? "YOUR TURN" : "OPPONENT'S TURN"

    if(currentParticipant.cardHand.length==0){
      let pulledCardCount = currentParticipant.refillEmptyHand(this.cardDeck)
      this.infoText = titleOfParticipant+" ran out of cards. "+titleOfParticipant
        +" pulled "+pulledCardCount+" from the deck.";
      await this.waitFewSeconds()
    }

    if(otherParticipant.cardHand.length==0){
      this.playersTurn = !(currentParticipant instanceof Player);
      await this.gameLoop();
    }

    if (this.playersTurn) {
      this.opponent.cardsAskedForMemory=[]

      return

    } else {
      this.playerCardElementClickable = false

      let chosenRank: String = this.opponent.askForCard(this.cardDeck)
      this.opponent.addToCardsAskedForMemory(chosenRank)
      await this.askAndReceiveCards(this.opponent, chosenRank)
      this.infoText="..."

      await this.gameLoop()
    }
  }

  async askAndReceiveCards(participant: GameParticipant, desiredRank: String){
    this.playerCardElementClickable = false

    let isPlayer = !(participant instanceof Opponent)

    let titleOfParticipant : String = isPlayer ? GAME_PARTICIPANT_TITLE.PLAYER : GAME_PARTICIPANT_TITLE.OPPONENT

    this.infoText = titleOfParticipant+" asked for the rank " + desiredRank + ".";
    await this.waitFewSeconds()

    let cardsReceivedFromOther : Array<Card> = [] = isPlayer ?
      this.opponent.giveCards(desiredRank) : this.player.giveCards(desiredRank);

    let receivedCards: Array<Card> = []

    if(cardsReceivedFromOther.length==0){
      let pulledCard = participant.pullFromDeck(this.cardDeck)
      if(pulledCard !== undefined){
        this.gameStateImage = participant.sprites.drawingCard
        receivedCards.push(pulledCard);
        this.infoText = pulledCard.rank==desiredRank?
          titleOfParticipant+" received desired rank from the deck." : titleOfParticipant+" didn't receive desired rank."
        let audioPath = pulledCard.rank==desiredRank?
          participant.soundEffects.success : participant.soundEffects.failure
        this.playAudio(audioPath)
      }
    }
    else{
      receivedCards = cardsReceivedFromOther
      this.gameStateImage = participant.sprites.receivingCard
      this.infoText = titleOfParticipant+" received "+receivedCards.length+" card(s).";
      let audioPath = receivedCards.length==0?
        this.playAudio(participant.soundEffects.failure) : this.playAudio(participant.soundEffects.success)
    }
    participant.receiveCards(receivedCards)
    await this.waitFewSeconds()

    if(participant.checkIfSetComplete(receivedCards[0].rank)){
      this.gameStateImage = participant.sprites.collectedSet
      this.infoText = titleOfParticipant+" completed a set of cards."
      this.playAudio(participant.soundEffects.completedSet)
      await this.waitFewSeconds()
    }

    let collectedSet = receivedCards[0].rank==desiredRank

    this.playersTurn = (isPlayer && collectedSet) || (!isPlayer && !collectedSet)
    this.playerCardElementClickable = this.playersTurn
  }

  async onCardElementClick(rank: String) {
    this.opponent.addToPlayersCardsMemory(rank)
    await this.askAndReceiveCards(this.player, rank)
    this.infoText="..."
    await this.gameLoop()
  }

  setCardElementMargins(whoseCards: String): string{
    let cardHand: Array<Card> = (whoseCards == GAME_PARTICIPANT_TITLE.PLAYER)?
      this.player.cardHand : this.opponent.cardHand;

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
    this.audio.volume = 0.7;
    this.audio.load()
    this.audio.play()
  }


  protected readonly GAME_PARTICIPANT_TITLE = GAME_PARTICIPANT_TITLE;
}
