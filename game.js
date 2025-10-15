document.addEventListener('DOMContentLoaded', () => {
    const gameplayButton = document.getElementById('gameplay-button');
    const gameImage = document.getElementById('game-image');
    const dummyRadios = document.querySelectorAll('input[name="dummy"]');
    const gameContainer = document.querySelector('#gameplay-scene');
    const bpmValue = document.getElementById('bpm-value');

    // 🩺 Create a text feedback element (e.g. "Good Pace")
    const feedbackText = document.createElement('p');
    feedbackText.id = 'bpm-feedback';
    feedbackText.style.fontSize = '1.2em';
    feedbackText.style.marginTop = '8px';
    feedbackText.style.color = '#ffffff';
    bpmValue.parentElement.appendChild(feedbackText);

    // Game variables
    let audioContext = null;
    let isGameRunning = false;
    let score = 0;
    let clicks = [];
    let gameTimer = null;
    let bpmInterval = null;
    let displayedBPM = 0;
    const buttonRadius = 40;
    const GAME_DURATION = 30000; // 30 seconds

    // Initialize Web Audio
    function initAudioContext() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    // Play short beep
    function playBeep() {
        if (!audioContext) return;

        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.value = 800;
        gain.gain.value = 0.1;

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.start();
        osc.stop(audioContext.currentTime + 0.08);
    }

    // Dummy selection (male/female)
    dummyRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'male') {
                gameImage.src = 'assets/maledummy.png';
                gameplayButton.style.top = '70%';
            } else {
                gameImage.src = 'assets/femaledummy.png';
                gameplayButton.style.top = '67%';
            }
        });
    });

    // Make button invisible
    gameplayButton.style.backgroundColor = 'transparent';
    gameplayButton.style.border = 'none';
    gameplayButton.style.outline = 'none';

    // Click to start and play
    gameContainer.addEventListener('click', (event) => {
        if (!isGameRunning) {
            initAudioContext();
            isGameRunning = true;
            score = 0;
            clicks = [];
            displayedBPM = 0;
            bpmValue.textContent = '--';
            feedbackText.textContent = '';
            bpmValue.style.color = 'white';
            gameplayButton.textContent = '';
            startGameTimer();
            return;
        }

        const buttonRect = gameplayButton.getBoundingClientRect();
        const buttonCenterX = buttonRect.left + buttonRect.width / 2;
        const buttonCenterY = buttonRect.top + buttonRect.height / 2;
        const distance = Math.hypot(event.clientX - buttonCenterX, event.clientY - buttonCenterY);

        // Only valid clicks trigger BPM and sound
        if (distance <= buttonRadius) {
            playBeep();
            const now = Date.now();
            clicks.push(now);

            // Keep only recent 10s of clicks
            clicks = clicks.filter(t => now - t < 10000);

            score++;
            showClickFeedback();
        } else {
            // Miss feedback
            gameImage.style.border = '2px solid #ff5252';
            setTimeout(() => gameImage.style.border = 'none', 300);
        }
    });

    // Dynamically update BPM (called continuously)
    function updateBPM() {
        const now = Date.now();
        clicks = clicks.filter(t => now - t < 10000);

        let targetBPM = 0;

        if (clicks.length >= 2) {
            const intervals = [];
            for (let i = 1; i < clicks.length; i++) {
                intervals.push(clicks[i] - clicks[i - 1]);
            }
            const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length;
            targetBPM = Math.round(60000 / avgInterval);
        }

        // 🩵 Faster, smoother decay (more responsive)
        const decayRate = 0.25; // Higher = faster updates
        displayedBPM += (targetBPM - displayedBPM) * decayRate;

        if (displayedBPM < 1) {
            bpmValue.textContent = '--';
            bpmValue.style.color = '#ff5252';
            feedbackText.textContent = 'No Pulse Detected';
            feedbackText.style.color = '#ff5252';
            return;
        }

        const roundedBPM = Math.round(displayedBPM);
        bpmValue.textContent = roundedBPM;

        // Color feedback and text feedback
        if (roundedBPM < 100) {
            bpmValue.style.color = '#ff5252';
            feedbackText.textContent = 'Too Slow';
            feedbackText.style.color = '#ff5252';
        } else if (roundedBPM > 120) {
            bpmValue.style.color = '#ff5252';
            feedbackText.textContent = 'Too Fast';
            feedbackText.style.color = '#ff5252';
        } else {
            bpmValue.style.color = '#4caf50';
            feedbackText.textContent = 'Good Pace';
            feedbackText.style.color = '#4caf50';
        }
    }

    // Visual feedback for correct clicks
    function showClickFeedback() {
        gameplayButton.style.backgroundColor = 'rgba(76, 175, 80, 0.5)';
        gameplayButton.style.border = '2px solid #4CAF50';
        setTimeout(() => {
            gameplayButton.style.backgroundColor = 'transparent';
            gameplayButton.style.border = 'none';
        }, 200);
    }

    // Start and end the game
    function startGameTimer() {
        clearTimeout(gameTimer);
        clearInterval(bpmInterval);

        bpmInterval = setInterval(updateBPM, 50); // update BPM every 50ms for faster response

        gameTimer = setTimeout(() => {
            isGameRunning = false;
            clearInterval(bpmInterval);
            gameplayButton.textContent = 'Game Over';
            feedbackText.textContent = '';
            alert(`Game Over! Your score: ${score}`);
        }, GAME_DURATION);
    }
});
