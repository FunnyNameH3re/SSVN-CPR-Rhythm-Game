document.addEventListener('DOMContentLoaded', () => {
    const gameplayButton = document.getElementById('gameplay-button');
    const gameImage = document.getElementById('game-image');
    const dummyRadios = document.querySelectorAll('input[name="dummy"]');
    const metronomeToggle = document.getElementById('metronome-toggle');
    const gameContainer = document.querySelector('#gameplay-scene');

    // Web Audio API for metronome sound
    let audioContext = null;
    let isGameRunning = false;
    let metronomeInterval;
    let lastBeatTime = 0;
    let score = 0;
    let clicks = [];
    const bpm = 100; // Fixed BPM
    const beatInterval = (60 / bpm) * 1000; // Convert BPM to milliseconds
    const buttonRadius = 40; // Radius of the invisible button (half of width/height)

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

    // Make the button invisible
    gameplayButton.style.backgroundColor = 'transparent';
    gameplayButton.style.border = 'none';
    gameplayButton.style.outline = 'none';

    // Start the game
    gameContainer.addEventListener('click', (event) => {
        if (!isGameRunning) {
            initAudioContext();
            startGame();
            return;
        }

        // Get button position and dimensions
        const buttonRect = gameplayButton.getBoundingClientRect();
        const buttonCenterX = buttonRect.left + buttonRect.width / 2;
        const buttonCenterY = buttonRect.top + buttonRect.height / 2;

        // Calculate distance from click to button center
        const clickX = event.clientX;
        const clickY = event.clientY;
        const distance = Math.sqrt(
            Math.pow(clickX - buttonCenterX, 2) +
            Math.pow(clickY - buttonCenterY, 2)
        );

        // Check if click is within the button radius
        if (distance <= buttonRadius) {
            const now = Date.now();
            clicks.push(now);
            checkClickAccuracy(now); // Only check beat accuracy if clicked in the right area
        } else {
            showFeedback(false, "Wrong area! Click the correct CPR spot.");
        }
    });

    // Start the metronome and game
    function startGame() {
        isGameRunning = true;
        gameplayButton.textContent = '';
        metronomeInterval = setInterval(() => {
            lastBeatTime = Date.now();

            // Play metronome beep if enabled
            if (metronomeToggle.checked) {
                playBeep();
            }
        }, beatInterval);
    }

    // Show visual feedback (Good!/Wrong area!/Missed!)
    function showFeedback(isGood, message) {
        const feedback = document.createElement('div');
        feedback.classList.add('feedback');
        feedback.classList.add(isGood ? 'feedback-good' : 'feedback-bad');
        feedback.textContent = message;
        document.body.appendChild(feedback);

        setTimeout(() => {
            feedback.remove();
        }, 500); // Disappear after 500ms
    }


    // Check if the player clicked close to the beat
    function checkClickAccuracy(clickTime) {
        const timeSinceLastBeat = clickTime - lastBeatTime;
        const accuracyThreshold = 150; // Milliseconds before/after the beat

        if (Math.abs(timeSinceLastBeat) < accuracyThreshold) {
            score++;
            showFeedback(true, "Good!");
            // Temporarily show the button
            gameplayButton.classList.add('visible');
            setTimeout(() => {
                gameplayButton.classList.remove('visible');
            }, 500); // Hide after 500ms
        } else {
            showFeedback(false, "Missed the beat!");
        }
    }



    // End the game (for demo purposes, after 30 seconds)
    setTimeout(() => {
        clearInterval(metronomeInterval);
        isGameRunning = false;
        gameplayButton.textContent = 'Game Over';
        alert(`Game Over! Your score: ${score}`);
    }, 30000); // 30 seconds
});
