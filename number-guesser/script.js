let humanScore = 0;
let computerScore = 0;
let currentRoundNumber = 1;

// generate target integer ranging from 0-9, both inclusive 
// Math.random() generates number 0-1, inclusive-exclusive
const generateTarget = () => Math.floor(Math.random() * 10);

// returns true if the human player wins, and false if the computer player wins.
const compareGuesses = (human, computer, target) => {
  const distanceHumanTarget = Math.abs(human - target);
  const distanceComputerTarget = Math.abs(computer - target);
  if (distanceHumanTarget < distanceComputerTarget) {
    return true;
  } else if (distanceHumanTarget >= distanceComputerTarget) {
    return false;
  }
};

const updateScore = winner => {
  if (winner === 'human') {
    humanScore++;
  } else if (winner === 'computer') {
    computerScore++;
  }
};

const advanceRound = () => {
  currentRoundNumber++;
};
