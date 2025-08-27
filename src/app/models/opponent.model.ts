import {GameParticipant} from './game-participant.model';
import {Card} from './card.model';

export class Opponent extends GameParticipant {

  playersCardsMemory: Array<String> = []
  cardsAskedForMemory: Array<String> = []

  constructor(cardHand: Array<Card>) {
    super(cardHand);
    this.soundEffects.success="../assets/audio/success-opponent.mp3"
    this.soundEffects.failure="../assets/audio/failure-opponent.mp3"
    this.soundEffects.completedSet="../assets/audio/complete-set-opponent.mp3"

    this.sprites.receivingCard = "../../assets/opponent/receiving_card.png"
    this.sprites.givingCard = "../../assets/opponent/giving_card.png"
    this.sprites.collectedSet = "../../assets/opponent/got_set.png"
    this.sprites.drawingCard = "../../assets/opponent/drawing_card.png"
  }

  askForCard(deck: Array<Card>) : String {
    //Checking if it has any of the ranks that the player recently asked
    let sharedRank = this.cardHand
      .filter(c => this.playersCardsMemory.includes(c.rank))
      .map(c => c.rank)
      .find(r => !this.cardsAskedForMemory.includes(r))

    if(sharedRank !== undefined){
      return sharedRank;
    }

    //Counting number of cards per rank
    let countPerRank: { [key: string]: number } = {}
    for (let c of this.cardHand) {
      countPerRank[c.rank.toString()] = (countPerRank[c.rank.toString()] || 0) + 1
    }
    let ranksSortedByAmount = Object.entries(countPerRank)
      .sort(([r1, n1], [r2, n2]) => n2 - n1)
      .map(([r, n]) => r)

    //Choosing one of the top 50% ranks with the largest quantity in random order
    let topRank = ranksSortedByAmount
      .slice(0, ranksSortedByAmount.length/2)
      .sort(() => Math.random() - 0.5)
      .find(r => !this.cardsAskedForMemory.includes(r))

    if(topRank !== undefined){
      return topRank
    }

    //Choosing random card
    let indexToChoose = Math.floor(Math.random() * this.cardHand.length)
    return this.cardHand[indexToChoose].rank;
  }

  addToPlayersCardsMemory(rank: String){
    if(this.playersCardsMemory.length <= 3){
      this.playersCardsMemory.shift()
    }
    this.playersCardsMemory.push(rank)

  }

  addToCardsAskedForMemory(rank: String){
    this.cardsAskedForMemory.push(rank)
  }
}
