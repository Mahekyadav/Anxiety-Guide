let currentPage = 1;
const totalPages = 5;
let focusMode = false;
let audioEnabled = true;
let soundscapeEnabled = false;

// Audio context for soft click sound (synthesized)
let audioContext;
let soundscapeSource;
let soundscapeGain;

function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function createWhiteNoise() {
    initAudio();
    
    // Create white noise buffer
    const bufferSize = 2 * audioContext.sampleRate;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    // Fill with random values and apply low-pass filter effect
    for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.3; // Softer white noise
    }
    
    // Create source
    soundscapeSource = audioContext.createBufferSource();
    soundscapeSource.buffer = noiseBuffer;
    soundscapeSource.loop = true;
    
    // Create gain node for volume control
    soundscapeGain = audioContext.createGain();
    soundscapeGain.gain.setValueAtTime(0, audioContext.currentTime);
    
    // Create low-pass filter for softer, rain-like sound
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, audioContext.currentTime);
    filter.Q.setValueAtTime(1, audioContext.currentTime);
    
    // Connect nodes
    soundscapeSource.connect(filter);
    filter.connect(soundscapeGain);
    soundscapeGain.connect(audioContext.destination);
    
    return soundscapeSource;
}

function toggleSoundscape() {
    soundscapeEnabled = !soundscapeEnabled;
    const button = document.querySelector('.soundscape-toggle');
    
    if (soundscapeEnabled) {
        if (!soundscapeSource) {
            soundscapeSource = createWhiteNoise();
            soundscapeSource.start(0);
        }
        
        // Fade in
        soundscapeGain.gain.cancelScheduledValues(audioContext.currentTime);
        soundscapeGain.gain.setValueAtTime(soundscapeGain.gain.value, audioContext.currentTime);
        soundscapeGain.gain.linearRampToValueAtTime(0.08, audioContext.currentTime + 2);
        
        button.textContent = '🔊 Soundscape';
    } else {
        // Fade out
        if (soundscapeGain) {
            soundscapeGain.gain.cancelScheduledValues(audioContext.currentTime);
            soundscapeGain.gain.setValueAtTime(soundscapeGain.gain.value, audioContext.currentTime);
            soundscapeGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 2);
        }
        
        button.textContent = '🔇 Soundscape';
    }
}

function playSoftClick() {
    if (!audioEnabled) return;
    initAudio();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

function nextPage(pageNumber) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    document.getElementById(`page-${pageNumber}`).classList.add('active');
    currentPage = pageNumber;
    updateProgress();
}

function updateProgress() {
    const progress = ((currentPage - 1) / (totalPages - 1)) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
}

function toggleFocus() {
    focusMode = !focusMode;
    const overlay = document.getElementById('focusOverlay');
    const button = document.querySelector('.focus-toggle');
    
    if (focusMode) {
        overlay.classList.add('active');
        button.textContent = '☀️ Restore Lights';
    } else {
        overlay.classList.remove('active');
        button.textContent = '🌙 Dim Lights';
    }
}

function checkGrounding(element) {
    element.classList.toggle('checked');
    playSoftClick();
}

function releaseStress() {
    const textarea = document.getElementById('stressInput');
    const text = textarea.value;
    
    if (!text.trim()) return;
    
    const container = document.getElementById('particleContainer');
    const message = document.getElementById('releaseMessage');
    
    // Clear previous particles
    container.innerHTML = '';
    
    // Create particles from text
    const words = text.split(/\s+/);
    const textareaRect = textarea.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    words.forEach((word, index) => {
        if (!word.trim()) return;
        
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.textContent = word;
        
        // Random starting position around textarea
        const startX = textareaRect.left - containerRect.left + Math.random() * textareaRect.width;
        const startY = textareaRect.top - containerRect.top + Math.random() * textareaRect.height;
        
        particle.style.left = startX + 'px';
        particle.style.top = startY + 'px';
        
        // Random end position
        const tx = (Math.random() - 0.5) * 400;
        const ty = (Math.random() - 0.5) * 400;
        const rot = (Math.random() - 0.5) * 720;
        
        particle.style.setProperty('--tx', tx + 'px');
        particle.style.setProperty('--ty', ty + 'px');
        particle.style.setProperty('--rot', rot + 'deg');
        
        container.appendChild(particle);
        
        // Trigger animation with slight delay
        setTimeout(() => {
            particle.style.animation = 'shatter 2s ease-out forwards';
        }, index * 50);
    });
    
    // Clear textarea and show message
    setTimeout(() => {
        textarea.value = '';
        message.classList.add('show');
        
        setTimeout(() => {
            message.classList.remove('show');
        }, 3000);
    }, 1000);
}

// Initialize progress bar
updateProgress();