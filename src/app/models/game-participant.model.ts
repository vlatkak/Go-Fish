import {Card} from './card.model';

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
  }

  giveCards(rank: String): Array<Card>{
    let chosenCards: Array<Card> = this.cardHand.filter(c => c.rank == rank);
    this.cardHand = this.cardHand.filter(c => c.rank !== rank);
    console.log("Given cards: "+chosenCards)

    return chosenCards;
  }

  pullFromDeck(deck: Array<Card>){
    if(deck.length > 0) {
      return <Card>deck.pop();
    }
    return
  }

  refillEmptyHand(deck: Array<Card>): number{
    let pulledCards: Array<Card> = []
    while (deck.length > 0 && pulledCards.length < 5) {
      let pulledCard = this.pullFromDeck(deck)
      if (pulledCard !== undefined) {
        pulledCards.push(pulledCard);
      }
    }
    this.receiveCards(pulledCards)
    return pulledCards.length
  }

  checkIfSetComplete(rank: String = ""): boolean{
    let setsNum = 0;

    let ranks: Set<String> = (rank=="")? new Set(this.cardHand.map(c => c.rank)) : new Set()
    if(rank!==""){
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
