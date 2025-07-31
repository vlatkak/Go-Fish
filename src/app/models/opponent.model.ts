import {GameParticipant} from './game-participant.model';
import {Card} from './card.model';

export class Opponent extends GameParticipant {

  playersCardsMemory: Array<String> = []

  askForCard(deck: Array<Card>) : String {
    let sharedRanks: Array<String> = this.cardHand
      .filter(c => this.playersCardsMemory.includes(c.rank))
      .map(c => c.rank)
    console.log("Opponents cards he shares with you: "+sharedRanks);

    if(sharedRanks.length > 0){
      let indexToChoose = Math.floor(Math.random() * sharedRanks.length)
      let chosenRank: String = sharedRanks[indexToChoose]
      console.log("Opponent remembered that you asked for this card: "+chosenRank)
      return chosenRank;
    }

    if (this.cardHand.length > 0) {
      //Counting number of cards per rank
      let countPerRank: { [key: string]: number } = {}
      for (let c of this.cardHand) {
        countPerRank[c.rank.toString()] = (countPerRank[c.rank.toString()] || 0) + 1
      }

      //Finding the rank that the opponent has the most of
      let maximumRankQuantity: number | undefined =
        Object.values(countPerRank).sort((a, b) => a - b).pop()
      let ranksOfLargestQuantity: Array<string> = Object.entries(countPerRank)
        .filter(c => c[1] == maximumRankQuantity)
        .map(c => c[0])

      //Choosing a card to ask for
      let indexToChoose = Math.floor(Math.random() * ranksOfLargestQuantity.length)
      let chosenRank: String = ranksOfLargestQuantity[indexToChoose]
      return chosenRank;
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

  addToMemory(rank: String){
    if(this.playersCardsMemory.length < 3){
      this.playersCardsMemory.push(rank)
    }
    else{
      this.playersCardsMemory.shift()
      this.playersCardsMemory.push(rank)
    }
    console.log(this.playersCardsMemory)
  }
}
