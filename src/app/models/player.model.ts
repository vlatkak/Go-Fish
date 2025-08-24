import {GameParticipant} from './game-participant.model';
import {Card} from './card.model';
import {Opponent} from './opponent.model';

export class Player extends GameParticipant {

  constructor(cardHand: Array<Card>) {
    super(cardHand);
    this.soundEffects.success="../assets/audio/success-player.mp3"
    this.soundEffects.failure="../assets/audio/failure-player.mp3"
    this.soundEffects.completedSet="../assets/audio/complete-set-player.mp3"

    this.sprites.receivingCard = "../../assets/opponent/giving_card.png"
    this.sprites.givingCard = "../../assets/opponent/receiving_card.png"
    this.sprites.collectedSet = "../../assets/opponent/idle.png"
    this.sprites.drawingCard = "../../assets/opponent/player_drawing_card.png"
  }

  /*async askOpponentForCard(opponent: Opponent, rank: String, deck: Array<Card>, infoText: String,
                           playerJustRecievedCard: boolean) {
    infoText = "You asked for a " + rank + ".";
    await this.waitFewSeconds()
    let receivedCards: Array<Card> = opponent.giveCard(rank);
    infoText = "You received " + receivedCards.length + " cards from opponent.";
    console.log("Number of cards in deck before " + deck.length);
    playerJustRecievedCard = this.receiveCards(receivedCards, deck, rank);
    console.log("Number of cards in deck after " + deck.length);
  }*/
}
