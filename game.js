document.addEventListener('DOMContentLoaded', () => {
    const gameplayButton = document.getElementById('gameplay-button');
    const gameImage = document.getElementById('game-image');
    const dummyRadios = document.querySelectorAll('input[name="dummy"]');
    const metronomeToggle = document.getElementById('metronome-toggle');

    // Web Audio API for metronome sound
    let audioContext = null;
    let isGameRunning = false;
    let metronomeInterval;
    let lastBeatTime = 0;
    let score = 0;
    let clicks = [];
    const bpm = 100; // Fixed BPM
    const beatInterval = (60 / bpm) * 1000; // Convert BPM to milliseconds

    // Initialize Web Audio API on first user interaction
    function initAudioContext() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    // Play a beep sound using Web Audio API
    function playBeep() {
        if (!audioContext) {
            console.error("AudioContext not initialized. Call initAudioContext() first.");
            return;
        }

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.value = 800; // Frequency of the beep (Hz)
        gainNode.gain.value = 0.1; // Volume of the beep

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1); // Beep duration (0.1s)
    }

    // Dummy selection logic
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

    // Start the game
    gameplayButton.addEventListener('click', () => {
        if (!isGameRunning) {
            // Initialize AudioContext on first click
            initAudioContext();
            startGame();
        } else {
            // Record click time for scoring
            const now = Date.now();
            clicks.push(now);
            checkClickAccuracy(now);
            flashButton(); // Flash on player click
        }
    });

    // Start the metronome and game
    function startGame() {
        isGameRunning = true;
        gameplayButton.textContent = 'Press Me!';
        gameplayButton.style.backgroundColor = '#4CAF50';

        metronomeInterval = setInterval(() => {
            lastBeatTime = Date.now();

            // Play metronome beep if enabled
            if (metronomeToggle.checked) {
                playBeep();
            }
        }, beatInterval);
    }

    // Flash the button on player click
    function flashButton() {
        gameplayButton.style.backgroundColor = '#ff5252'; // Red flash
        setTimeout(() => {
            gameplayButton.style.backgroundColor = '#4CAF50'; // Back to green
        }, 100);
    }

    // Show visual feedback (Good!/Missed!)
    function showFeedback(isGood) {
        const feedback = document.createElement('div');
        feedback.style.position = 'fixed';
        feedback.style.top = '50%';
        feedback.style.left = '50%';
        feedback.style.transform = 'translate(-50%, -50%)';
        feedback.style.fontSize = '24px';
        feedback.style.fontWeight = 'bold';
        feedback.style.color = isGood ? 'green' : 'red';
        feedback.style.zIndex = '100';
        feedback.textContent = isGood ? 'Good!' : 'Missed!';
        document.body.appendChild(feedback);

        setTimeout(() => {
            feedback.remove();
        }, 500);
    }

    // Check if the player clicked close to the beat
    function checkClickAccuracy(clickTime) {
        const timeSinceLastBeat = clickTime - lastBeatTime;
        const accuracyThreshold = 150; // Milliseconds before/after the beat

        if (Math.abs(timeSinceLastBeat) < accuracyThreshold) {
            score++;
            console.log(`Good click! Score: ${score}`);
            showFeedback(true); // Show "Good!"
        } else {
            console.log('Missed the beat!');
            showFeedback(false); // Show "Missed!"
        }
    }

    // End the game (for demo purposes, after 30 seconds)
    setTimeout(() => {
        clearInterval(metronomeInterval);
        isGameRunning = false;
        gameplayButton.textContent = 'Game Over';
        gameplayButton.style.backgroundColor = '#f44336';
        alert(`Game Over! Your score: ${score}`);
    }, 30000); // 30 seconds
});
