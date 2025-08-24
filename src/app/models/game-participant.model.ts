import {Card} from './card.model';
import {RECEIVED_TYPE} from '../constants/constants';

export class GameParticipant {
  cardHand: Array<Card>;
  completeSetNum: number = 0;
  soundEffects = {success: "", failure: "", completedSet: ""}
  sprites = {receivingCard: "", givingCard: "", collectedSet: "", drawingCard: ""}

  constructor(cardHand: Array<Card>) {
    this.cardHand= cardHand;
  }

  receiveCards(cardsReceived: Array<Card>): void {
    this.cardHand = this.cardHand.concat(cardsReceived);
    console.log(cardsReceived)
    console.log(this.cardHand)
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

  checkIfSetComplete(rank: String = ""): boolean{
    let setsNum = 0;

    let ranks: Set<String>
    if(rank==""){
      ranks = new Set(this.cardHand.map(c => c.rank))
    }
    else{
      ranks = new Set()
      ranks.add(rank)
    }
    for(let r of ranks){
      let cardsOfRank: Array<Card> = this.cardHand.filter(c => c.rank == r);
      if(cardsOfRank.length == 4){
        this.cardHand = this.cardHand.filter(c => c.rank !== r);
        this.completeSetNum = this.completeSetNum + 1
        setsNum++
        console.log("Set complete for rank "+r)
      }
    }
    return setsNum > 0;
  }

}
