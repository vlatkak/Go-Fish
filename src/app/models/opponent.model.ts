import {GameParticipant} from './game-participant.model';
import {Card} from './card.model';

export class Opponent extends GameParticipant {

  playersCardsMemory: Array<String> = []
  cardsAskedForMemory: Array<String> = []

  askForCard(deck: Array<Card>) : String {
    console.log("Cards opponent asked for in this round: "+this.cardsAskedForMemory);
    //Checking if it has any of the ranks that the player recently asked
    if (this.cardHand.length > 0) {
      let sharedRanks: Array<String> = this.cardHand
        .filter(c => this.playersCardsMemory.includes(c.rank))
        .map(c => c.rank)
      console.log("Opponents cards he shares with you: "+sharedRanks);

      //Asking for one of those ranks
      for(let r of sharedRanks){
        if(!this.cardsAskedForMemory.includes(r)){
          return r
        }
      }

      //Counting number of cards per rank
      let countPerRank: { [key: string]: number } = {}
      for (let c of this.cardHand) {
        countPerRank[c.rank.toString()] = (countPerRank[c.rank.toString()] || 0) + 1
      }
      let ranksSortedByAmount = Object.entries(countPerRank)
        .sort(([r1, n1], [r2, n2]) => n2 - n1)
        .map(([r, n]) => r)
      console.log("Opponent ranks sorted by amount in hand: "+ranksSortedByAmount);

      //Choosing one of the ranks with the largest quantity
      for(let r of ranksSortedByAmount){
        if(!this.cardsAskedForMemory.includes(r)){
          return r
        }
      }

      //Choosing random card
      let indexToChoose = Math.floor(Math.random() * this.cardHand.length)
      return this.cardHand[indexToChoose].rank;
    }
    else{
      let pulledCard: Card | undefined = this.pullFromDeck(deck);
      if(pulledCard != undefined) {
        this.cardHand = this.cardHand.concat(pulledCard)
        return pulledCard?.rank
      }else{
        return "nothing"
      }
    }
  }

  addToPlayerCardsMemory(rank: String){
    if(this.playersCardsMemory.length < 3){
      this.playersCardsMemory.push(rank)
    }
    else{
      this.playersCardsMemory.shift()
      this.playersCardsMemory.push(rank)
    }
    console.log(this.playersCardsMemory)
  }

  addToCardsAskedForMemory(rank: String){
    this.cardsAskedForMemory.push(rank)
  }
}
