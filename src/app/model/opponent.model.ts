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

    this.sprites.receivingCard = "../../assets/opponent/receiving_card.webp"
    this.sprites.givingCard = "../../assets/opponent/giving_card.webp"
    this.sprites.collectedSet = "../../assets/opponent/got_set.webp"
    this.sprites.drawingCard = "../../assets/opponent/drawing_card.webp"
  }

  chooseRank(deck: Array<Card>) : String {
    let ranksNotAskedForYet = this.cardHand.filter(c => !this.cardsAskedForMemory.includes(c.rank))

    if(ranksNotAskedForYet.length==0){
      console.log("All ranks already asked for.")
      let indexToChoose = Math.floor(Math.random() * this.cardHand.length)
      return this.cardHand[indexToChoose].rank;
    }

    //Checking if it has any of the ranks that the player recently asked for
    let sharedRanks = ranksNotAskedForYet
      .filter(c => this.playersCardsMemory.includes(c.rank))
      .map(c => c.rank)

    console.log("Cards you asked for memory:")
    console.log(this.playersCardsMemory)
    if(sharedRanks[0] !== undefined){
      console.log("Chosen one of shared")
      return sharedRanks[0];
    }


    //Counting number of cards per rank
    let countPerRank: { [key: string]: number } = {}
    for (let c of ranksNotAskedForYet) {
      countPerRank[c.rank.toString()] = (countPerRank[c.rank.toString()] || 0) + 1
    }

    //70% chance that opponent will choose a rank he has 3 of, 30% chance he'll choose one he has 2 of
    let whichToChoose = Math.floor(Math.random() * 10)
    let numberOfCardsForRank = 2
    if(whichToChoose < 7 && Object.values(countPerRank).includes(3)){
      numberOfCardsForRank = 3
    }

    let ranksFilteredByAmount = Object.entries(countPerRank)
      .filter(([r, n]) => n==numberOfCardsForRank)
      .map(([r, n]) => r)

    //Choosing random rank of previously chosen quantity
    let indexToChoose = Math.floor(Math.random() * ranksFilteredByAmount.length);
    let topRank = ranksFilteredByAmount[indexToChoose];

    console.log("Top ranks ("+numberOfCardsForRank+"):")
    console.log(ranksFilteredByAmount)
    if(topRank !== undefined){
      console.log("Chosen one of top")
      return topRank
    }

    //Choosing random card
    indexToChoose = Math.floor(Math.random() * ranksNotAskedForYet.length);
    console.log("Chosen randomly")
    return ranksNotAskedForYet[indexToChoose].rank;
  }

  addToPlayersCardsMemory(rank: String): void{
    if(this.playersCardsMemory.length >= 3){
      this.playersCardsMemory.shift()
    }
    this.playersCardsMemory.push(rank)
  }

  addToCardsAskedForMemory(rank: String){
    this.cardsAskedForMemory.push(rank)
  }
}
