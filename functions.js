const configs = {
  easy: { rows: 3, cols: 2, pairs: 3 },
  medium: { rows: 4, cols: 3, pairs: 6 },
  hard: { rows: 4, cols: 4, pairs: 8 }
};

// Replace these URLs with your own image paths (local or hosted)
const images = [
  'assets/app-development.png',
  'assets/wifi.png',
  'assets/motherboard.png',
  'assets/nano.png',
  'assets/pen-drive.png',
  'assets/programming.png',
  'assets/smartwatch.png',
  'assets/video-lesson.png'
];

let lives = 3;
let score = 0;
let consecutiveCorrect = 0;
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchedPairs = 0;
let currentLevel = null;
let firstPlay = true;

// Audio setup
const bgm = document.getElementById('bgm');
const winSound = document.getElementById('win-sound');
const loseSound = document.getElementById('lose-sound');
const muteBtn = document.getElementById('mute-btn');
bgm.volume = 0.2;
winSound.volume = 0.5;
loseSound.volume = 0.5;

muteBtn.addEventListener('click', () => {
  if (bgm.paused) {
    bgm.play().catch(() => {});
    muteBtn.textContent = '🔊';
  } else {
    bgm.pause();
    muteBtn.textContent = '🔇';
  }
});

// Add touch events for developer name interactivity
const developerName = document.getElementById('developer-name');
developerName.addEventListener('touchstart', () => {
  developerName.classList.add('hover');
});
developerName.addEventListener('touchend', () => {
  developerName.classList.remove('hover');
});

function startGame(level) {
  currentLevel = level;
  firstPlay = true;
  const { rows, cols, pairs } = configs[level];
  document.getElementById('level-selection').classList.add('hidden');
  document.getElementById('developer-name').classList.add('hidden');
  document.getElementById('game-area').classList.remove('hidden');
  document.getElementById('modal').classList.add('hidden');
  
  lives = 3;
  score = 0;
  consecutiveCorrect = 0;
  matchedPairs = 0;
  updateStats();

  const cards = generateCards(pairs);
  renderGrid(cards, rows, cols);
  
  const grid = document.getElementById('card-grid');
  grid.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;

  bgm.play().catch(() => {});
}

function generateCards(pairs) {
  const selectedImages = images.slice(0, pairs);
  const cards = [...selectedImages, ...selectedImages]
    .map((img, index) => ({ id: index, img, matched: false }))
    .sort(() => Math.random() - 0.5);
  return cards;
}

function renderGrid(cards, rows, cols) {
  const grid = document.getElementById('card-grid');
  grid.innerHTML = '';
  cards.forEach(card => {
    const cardElement = document.createElement('div');
    cardElement.className = `card h-20 sm:h-24 cursor-pointer touch-none ${firstPlay ? 'flipped' : ''}`;
    cardElement.dataset.id = card.id;
    cardElement.dataset.img = card.img;
    
    const cardInner = document.createElement('div');
    cardInner.className = 'card-inner';
    
    const cardFront = document.createElement('div');
    cardFront.className = 'card-front';
    const imgElement = document.createElement('img');
    imgElement.src = card.img;
    imgElement.alt = 'Card image';
    imgElement.loading = 'lazy';
    cardFront.appendChild(imgElement);
    
    const cardBack = document.createElement('div');
    cardBack.className = 'card-back';
    
    cardInner.appendChild(cardFront);
    cardInner.appendChild(cardBack);
    cardElement.appendChild(cardInner);
    
    cardElement.addEventListener('click', () => flipCard(cardElement, card));
    grid.appendChild(cardElement);
  });

  if (firstPlay) {
    const countdown = document.getElementById('countdown');
    const countdownText = document.getElementById('countdown-text');
    countdown.classList.remove('hidden');
    
    let timeLeft = 5;
    countdownText.textContent = timeLeft;
    
    const countdownInterval = setInterval(() => {
      timeLeft--;
      if (timeLeft > 0) {
        countdownText.textContent = timeLeft;
      } else if (timeLeft === 0) {
        countdownText.textContent = 'Start!';
      } else {
        clearInterval(countdownInterval);
        countdown.classList.add('hidden');
      }
    }, 1000);

    setTimeout(() => {
      document.querySelectorAll('.card').forEach(card => card.classList.remove('flipped'));
      firstPlay = false;
    }, 5000);
  }
}

function flipCard(cardElement, card) {
  if (lockBoard || cardElement === firstCard || card.matched) return;
  
  cardElement.classList.add('flipped');
  cardElement.classList.add('scale-105');

  if (!firstCard) {
    firstCard = { element: cardElement, card };
    return;
  }

  secondCard = { element: cardElement, card };
  lockBoard = true;

  setTimeout(checkMatch, 1000);
}

function checkMatch() {
  const isMatch = firstCard.card.img === secondCard.card.img;

  if (isMatch) {
    firstCard.card.matched = true;
    secondCard.card.matched = true;
    firstCard.element.classList.add('bg-green-200');
    secondCard.element.classList.add('bg-green-200');
    score += 10;
    matchedPairs++;
    consecutiveCorrect++;
    
    if (consecutiveCorrect === 3) {
      if (lives < 3) {
        lives = Math.min(3, lives + 1);
      } else {
        lives++;
      }
      consecutiveCorrect = 0;
    }

    updateStats();
    if (matchedPairs === configs[currentLevel].pairs) {
      setTimeout(() => showModal('Victory!', 'green-400', winSound), 500);
    }
    resetBoard();
  } else {
    lives--;
    consecutiveCorrect = 0;
    updateStats();
    firstCard.element.classList.remove('flipped', 'scale-105');
    secondCard.element.classList.remove('flipped', 'scale-105');
    resetBoard();

    if (lives === 0) {
      setTimeout(() => showModal('Quest Failed!', 'red-400', loseSound), 500);
    }
  }
}

function showModal(title, titleColor, sound) {
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalScore = document.getElementById('modal-score');
  const modalContent = modal.querySelector('.modal-content');
  
  modalTitle.textContent = title;
  modalTitle.className = `text-base sm:text-xl text-${titleColor} pixel-font mb-1 sm:mb-2`;
  modalScore.textContent = `Final Score: ${score} 💰`;
  modal.classList.remove('hidden');
  modalContent.classList.add('show');
  
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

function resetBoard() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

function updateStats() {
  document.getElementById('lives').innerHTML = '❤️'.repeat(lives);
  document.getElementById('score').innerHTML = `${score} 💰`;
}

function resetGame() {
  const modalContent = document.querySelector('.modal-content');
  modalContent.classList.remove('show');
  document.getElementById('game-area').classList.add('hidden');
  document.getElementById('modal').classList.add('hidden');
  document.getElementById('level-selection').classList.remove('hidden');
  document.getElementById('developer-name').classList.remove('hidden');
  document.getElementById('card-grid').innerHTML = '';
}

document.getElementById('restart-btn').addEventListener('click', () => {
  firstPlay = false;
  startGame(currentLevel);
});