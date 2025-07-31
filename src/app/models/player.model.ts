import {GameParticipant} from './game-participant.model';
import {Card} from './card.model';
import {Opponent} from './opponent.model';

export class Player extends GameParticipant {
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
