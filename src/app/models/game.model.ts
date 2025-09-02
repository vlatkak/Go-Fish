import {GAME_PARTICIPANT_TITLE, IDLE_STATE} from '../constants/constants';
import {GameParticipant} from './game-participant.model';
import {Player} from './player.model';
import {Opponent} from './opponent.model';
import {Card} from './card.model';
import {Router} from '@angular/router';

export class Game {
  infoText: String;
  whoseTurnText: String;
  audio: HTMLAudioElement;
  gameStateImage: String;

  secondsElapsed : Number;

  deck: Array<Card>;
  opponent: Opponent;
  player: Player;

  playerCardElementClickable: Boolean;
  playersTurn: Boolean;
  gameExited: Boolean;
  gameEnded: Boolean;

  router: Router;

  constructor(router: Router, deck: Array<Card>, opponent: Opponent, player: Player) {
    this.infoText = "...";
    this.whoseTurnText = "YOUR TURN";
    this.audio = new Audio();
    this.gameStateImage = IDLE_STATE;
    this.secondsElapsed = 0
    this.deck = deck;
    this.opponent = opponent;
    this.player = player;
    this.playersTurn = true;
    this.playerCardElementClickable = true;
    this.gameEnded= false;
    this.gameExited= false;
    this.router = router;
  }

  async gameLoop() {
    //Checking if the game is finished
    if(this.gameExited) return

    if (this.player.cardHand.length == 0 && this.opponent.cardHand.length == 0) {
      this.gameStateImage = IDLE_STATE
      this.gameEnded=true
      this.router.navigate(['/end', this.player.completeSetNum, this.opponent.completeSetNum, this.secondsElapsed])
      return
    }

    //Configuring info text, checking if participants hands are empty
    const currentParticipant: GameParticipant = this.playersTurn ? this.player : this.opponent
    let titleOfParticipant : String = this.playersTurn ? GAME_PARTICIPANT_TITLE.PLAYER : GAME_PARTICIPANT_TITLE.OPPONENT

    this.gameStateImage = IDLE_STATE
    this.whoseTurnText = this.playersTurn? "YOUR TURN" : "OPPONENT'S TURN"

    if(currentParticipant.cardHand.length==0){
      let pulledCards: Array<Card> = []
      while (this.deck.length > 0 && pulledCards.length < 5) {
        let pulledCard = currentParticipant.pullFromDeck(this.deck)
        if (pulledCard !== undefined) {
          pulledCards.push(pulledCard);
        }
      }
      currentParticipant.receiveCards(pulledCards)
      this.infoText = titleOfParticipant+" ran out of cards. "+titleOfParticipant
        +" pulled "+pulledCards.length+" from the deck.";
      await this.waitFewSeconds()
    }

    //Player specific actions
    if (this.playersTurn) {
      this.opponent.cardsAskedForMemory=[]
      return

    } //Opponent specific actions
    else {
      this.playerCardElementClickable = false

      let chosenRank: String = this.opponent.chooseRank(this.deck)
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

    let audioPath = ""
    let infoTextString = ""

    if(cardsReceivedFromOther.length==0){
      let pulledCard = participant.pullFromDeck(this.deck)
      if(pulledCard !== undefined){
        this.gameStateImage = participant.sprites.drawingCard
        receivedCards.push(pulledCard);
        infoTextString = pulledCard.rank==desiredRank?
          titleOfParticipant+" received desired rank from the deck." : titleOfParticipant+" didn't receive desired rank."
        audioPath = pulledCard.rank==desiredRank?
          participant.soundEffects.success : participant.soundEffects.failure
      }
    }
    else{
      receivedCards = cardsReceivedFromOther
      this.gameStateImage = participant.sprites.receivingCard
      infoTextString = titleOfParticipant+" received "+receivedCards.length+" card(s).";
      audioPath = receivedCards.length==0?
        participant.soundEffects.failure : participant.soundEffects.success
    }

    participant.receiveCards(receivedCards)
    this.playAudio(audioPath)
    this.infoText = infoTextString

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

  async waitFewSeconds() {
    let timeToWait = Math.random() * 2000 + 2000;
    return new Promise(resolve => setTimeout(resolve, timeToWait));
  }

  playAudio(resource: string){
    this.audio.src = resource;
    this.audio.volume = 0.7;
    this.audio.load()
    this.audio.play()
  }
}
