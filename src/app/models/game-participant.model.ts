import {Card} from './card.model';
import {RECIEVED_TYPE} from '../constants/constants';

export class GameParticipant {
  cardHand: Array<Card>;
  completeSetNum: number = 0;

  constructor(cardDeck: Array<Card>) {
    this.cardHand= cardDeck;
  }

  receiveCards(cards: Array<Card>, deck: Array<Card>, desiredRank: String): number {
    if(cards.length == 0){
      let pulledCard: Card | undefined = this.pullFromDeck(deck);
      if(pulledCard !== undefined) {
        this.cardHand = this.cardHand.concat(pulledCard)
        this.checkIfSetComplete()
        if(pulledCard.rank==desiredRank){
          return RECIEVED_TYPE.CARD_FROM_DECK
        }else{
          return RECIEVED_TYPE.NONE_DESIRED
        }
      }else{
        return RECIEVED_TYPE.NONE_DESIRED
      }
    }
    this.cardHand = this.cardHand.concat(cards);
    this.checkIfSetComplete()
    console.log(cards)
    console.log(this.cardHand)
    return RECIEVED_TYPE.CARD_FROM_PLAYER;
  }

  giveCards(rank: String): Array<Card>{
    let chosenCards: Array<Card> = this.cardHand.filter(c => c.rank == rank);
    this.cardHand = this.cardHand.filter(c => c.rank !== rank);
    console.log("Given cards: "+chosenCards)
    if(this.cardHand.length == 0){
      console.log("No cards in hand for person to give.")
    }
    return chosenCards;
  }

  pullFromDeck(deck: Array<Card>){
    if(deck.length > 0) {
      let pulledCard: Card = <Card>deck.pop()
      console.log("Card pulled from deck: " + pulledCard.rank +" of "+ pulledCard.suit)
      return pulledCard;
    }
    else{
      return
    }
  }

  checkIfSetComplete(): void{
    for(let c of this.cardHand){
      let cardsOfRank: Array<Card> = this.cardHand.filter(c2 => c2.rank == c.rank);
      if(cardsOfRank.length == 4){
        this.cardHand = this.cardHand.filter(c2 => c2.rank !== c.rank);
        this.completeSetNum = this.completeSetNum + 1
        console.log("Set complete for rank "+c.rank)
      }
    }
  }

}
