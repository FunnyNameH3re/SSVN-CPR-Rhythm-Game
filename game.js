// Game settings
const bpm = 100;
const beatInterval = 60000 / bpm; // 600ms per beat
let lastBeatTime = 0;
let score = 0;

// DOM elements
const beatIndicator = document.getElementById('beat-indicator');
const scoreDisplay = document.getElementById('score');

// Play a visual beat
function playBeat() {
  beatIndicator.style.transform = 'scale(1.2)';
  setTimeout(() => {
    beatIndicator.style.transform = 'scale(1)';
  }, 100);
  lastBeatTime = Date.now();
}

// Start the metronome
const beatTimer = setInterval(playBeat, beatInterval);

// Handle player taps
document.addEventListener('click', () => {
  const now = Date.now();
  const timeSinceLastBeat = now - lastBeatTime;

  // Perfect tap: within 100ms of the beat
  if (Math.abs(timeSinceLastBeat) < 100) {
    score++;
    scoreDisplay.textContent = `Score: ${score}`;
    beatIndicator.style.backgroundColor = 'green';
    setTimeout(() => {
      beatIndicator.style.backgroundColor = 'red';
    }, 100);
  } else {
    beatIndicator.style.backgroundColor = 'blue';
    setTimeout(() => {
      beatIndicator.style.backgroundColor = 'red';
    }, 100);
  }
});
