// DOM Elements
const navLinks = document.querySelectorAll('.nav-link');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const searchBtn = document.getElementById('searchBtn');
const resourceSearch = document.getElementById('resourceSearch');
const searchTags = document.querySelectorAll('.search-tag');
const breathingModal = document.getElementById('breathingModal');
const moodModal = document.getElementById('moodModal');
const emergencyModal = document.getElementById('emergencyModal');
const closeModalButtons = document.querySelectorAll('.close-modal');
const emergencyBtn = document.getElementById('emergencyBtn');
const breathingBtn = document.getElementById('breathingBtn');
const breathingToolBtn = document.getElementById('breathingToolBtn');
const moodTrackerBtn = document.getElementById('moodTrackerBtn');
const emergencyToolBtn = document.getElementById('emergencyToolBtn');
const startBreathingBtn = document.getElementById('startBreathing');
const stopBreathingBtn = document.getElementById('stopBreathing');
const breathingCircle = document.getElementById('breathingCircle');
const breathCountElement = document.getElementById('breathCount');
const moodOptions = document.querySelectorAll('.mood-option');
const saveMoodBtn = document.getElementById('saveMood');
const moodNotes = document.getElementById('moodNotes');
const moodHistoryChart = document.getElementById('moodHistoryChart');
const resourcesGrid = document.querySelector('.resources-grid');

// Sample resources data
const resources = [
    {
        id: 1,
        title: "5-4-3-2-1 Grounding Technique",
        description: "A simple mindfulness exercise to help manage anxiety by focusing on your senses.",
        tag: "anxiety",
        icon: "fas fa-mountain"
    },
    {
        id: 2,
        title: "Progressive Muscle Relaxation",
        description: "A technique that involves tensing and relaxing muscle groups to reduce anxiety.",
        tag: "anxiety",
        icon: "fas fa-spa"
    },
    {
        id: 3,
        title: "Cognitive Behavioral Therapy (CBT) Basics",
        description: "Learn how to identify and change negative thought patterns.",
        tag: "therapy",
        icon: "fas fa-brain"
    },
    {
        id: 4,
        title: "Mindfulness Meditation Guide",
        description: "Step-by-step instructions for starting a mindfulness meditation practice.",
        tag: "meditation",
        icon: "fas fa-yin-yang"
    },
    {
        id: 5,
        title: "Sleep Hygiene Tips",
        description: "Practical advice for improving sleep quality, which can help with depression.",
        tag: "sleep",
        icon: "fas fa-bed"
    },
    {
        id: 6,
        title: "Self-Care Ideas for Difficult Days",
        description: "Gentle activities to nurture yourself when you're struggling.",
        tag: "self-care",
        icon: "fas fa-heart"
    },
    {
        id: 7,
        title: "Understanding Depression",
        description: "Information about depression symptoms, causes, and treatment options.",
        tag: "depression",
        icon: "fas fa-book-medical"
    },
    {
        id: 8,
        title: "Building a Support System",
        description: "How to reach out and build connections when dealing with mental health challenges.",
        tag: "depression",
        icon: "fas fa-hands-helping"
    }
];

// Mood tracking data
let moodHistory = JSON.parse(localStorage.getItem('moodHistory')) || [];
let selectedMood = null;

// Breathing exercise variables
let breathingInterval;
let isBreathing = false;
let breathCount = 0;
let currentBreathPhase = 0; // 0: inhale, 1: hold1, 2: exhale, 3: hold2
const breathPhases = [
    { name: "Breathe In", duration: 4000, instruction: "inhale" },
    { name: "Hold", duration: 4000, instruction: "hold1" },
    { name: "Breathe Out", duration: 6000, instruction: "exhale" },
    { name: "Rest", duration: 2000, instruction: "hold2" }
];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Load resources
    loadResources();
    
    // Load mood history chart
    loadMoodHistoryChart();
    
    // Set up event listeners
    setupEventListeners();
    
    // Animate elements on scroll
    setupScrollAnimations();
});

// Set up event listeners
function setupEventListeners() {
    // Navigation
    hamburger.addEventListener('click', toggleMobileMenu);
    
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    });
    
    // Search functionality
    searchBtn.addEventListener('click', searchResources);
    resourceSearch.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchResources();
    });
    
    searchTags.forEach(tag => {
        tag.addEventListener('click', function() {
            const tagName = this.getAttribute('data-tag');
            resourceSearch.value = tagName;
            searchResources();
        });
    });
    
    // Modal functionality
    emergencyBtn.addEventListener('click', () => openModal(emergencyModal));
    breathingBtn.addEventListener('click', () => openModal(breathingModal));
    breathingToolBtn.addEventListener('click', () => openModal(breathingModal));
    moodTrackerBtn.addEventListener('click', () => openModal(moodModal));
    emergencyToolBtn.addEventListener('click', () => openModal(emergencyModal));
    
    closeModalButtons.forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeAllModals();
        }
    });
    
    // Breathing exercise
    startBreathingBtn.addEventListener('click', startBreathingExercise);
    stopBreathingBtn.addEventListener('click', stopBreathingExercise);
    
    // Mood tracker
    moodOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove selected class from all options
            moodOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Add selected class to clicked option
            this.classList.add('selected');
            selectedMood = this.getAttribute('data-mood');
        });
    });
    
    saveMoodBtn.addEventListener('click', saveMoodEntry);
}

// Toggle mobile menu
function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
}

// Load resources into the grid
function loadResources(filter = '') {
    resourcesGrid.innerHTML = '';
    
    let filteredResources = resources;
    
    if (filter) {
        filteredResources = resources.filter(resource => 
            resource.title.toLowerCase().includes(filter.toLowerCase()) ||
            resource.description.toLowerCase().includes(filter.toLowerCase()) ||
            resource.tag.toLowerCase().includes(filter.toLowerCase())
        );
    }
    
    filteredResources.forEach(resource => {
        const resourceCard = document.createElement('div');
        resourceCard.className = 'resource-card';
        resourceCard.innerHTML = `
            <div class="resource-image" style="background-color: ${getRandomColor()}">
                <div style="height: 100%; display: flex; align-items: center; justify-content: center;">
                    <i class="${resource.icon}" style="font-size: 3rem; color: white;"></i>
                </div>
            </div>
            <div class="resource-content">
                <span class="resource-tag">${capitalizeFirstLetter(resource.tag)}</span>
                <h3>${resource.title}</h3>
                <p>${resource.description}</p>
                <button class="tool-btn read-more-btn" data-id="${resource.id}">Read More</button>
            </div>
        `;
        
        resourcesGrid.appendChild(resourceCard);
    });
    
    // Add event listeners to "Read More" buttons
    document.querySelectorAll('.read-more-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const resourceId = this.getAttribute('data-id');
            const resource = resources.find(r => r.id == resourceId);
            alert(`More information about: ${resource.title}\n\n${resource.description}\n\nThis resource focuses on: ${resource.tag}`);
        });
    });
}

// Search resources
function searchResources() {
    const searchTerm = resourceSearch.value.trim();
    loadResources(searchTerm);
    
    // Scroll to resources section if not empty
    if (searchTerm) {
        document.getElementById('resources').scrollIntoView({ behavior: 'smooth' });
    }
}

// Get random color for resource cards
function getRandomColor() {
    const colors = ['#5d6afb', '#6bc5c5', '#ff9e7d', '#48bb78', '#ed8936'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Open modal
function openModal(modal) {
    closeAllModals();
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close all modals
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
    document.body.style.overflow = 'auto';
    
    // Stop breathing exercise if running
    if (isBreathing) {
        stopBreathingExercise();
    }
}

// Breathing exercise functions
function startBreathingExercise() {
    if (isBreathing) return;
    
    isBreathing = true;
    startBreathingBtn.disabled = true;
    stopBreathingBtn.disabled = false;
    
    // Reset if starting fresh
    if (breathCount === 0) {
        currentBreathPhase = 0;
        updateBreathingUI();
    }
    
    breathingInterval = setInterval(cycleBreathing, breathPhases[currentBreathPhase].duration);
}

function stopBreathingExercise() {
    isBreathing = false;
    startBreathingBtn.disabled = false;
    stopBreathingBtn.disabled = true;
    
    clearInterval(breathingInterval);
    
    // Reset animation
    breathingCircle.style.animation = 'none';
    void breathingCircle.offsetWidth; // Trigger reflow
}

function cycleBreathing() {
    currentBreathPhase = (currentBreathPhase + 1) % breathPhases.length;
    
    // Increment breath count after full cycle
    if (currentBreathPhase === 0) {
        breathCount++;
        breathCountElement.textContent = breathCount;
        
        // Show completion message every 5 breaths
        if (breathCount % 5 === 0) {
            showNotification(`Great job! You've completed ${breathCount} breaths.`);
        }
    }
    
    updateBreathingUI();
    
    // Set next interval
    clearInterval(breathingInterval);
    breathingInterval = setInterval(cycleBreathing, breathPhases[currentBreathPhase].duration);
}

function updateBreathingUI() {
    const phase = breathPhases[currentBreathPhase];
    
    // Update circle animation
    breathingCircle.style.animation = 'none';
    void breathingCircle.offsetWidth; // Trigger reflow
    
    if (phase.name === "Breathe In") {
        breathingCircle.style.animation = 'expand 4s ease-in-out forwards';
    } else if (phase.name === "Breathe Out") {
        breathingCircle.style.animation = 'contract 6s ease-in-out forwards';
    }
    
    // Update text
    breathingCircle.querySelector('.breathing-text').textContent = phase.name;
    
    // Update instructions
    document.querySelectorAll('.instruction').forEach(instruction => {
        instruction.classList.remove('active');
    });
    
    document.getElementById(phase.instruction).classList.add('active');
}

// Create CSS animation for breathing
const breathingAnimationCSS = document.createElement('style');
breathingAnimationCSS.textContent = `
    @keyframes expand {
        0% { transform: scale(1); }
        100% { transform: scale(1.2); }
    }
    
    @keyframes contract {
        0% { transform: scale(1.2); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(breathingAnimationCSS);

// Mood tracker functions
function saveMoodEntry() {
    if (!selectedMood) {
        showNotification('Please select a mood first', 'error');
        return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const notes = moodNotes.value.trim();
    
    // Check if mood already recorded today
    const existingIndex = moodHistory.findIndex(entry => entry.date === today);
    
    if (existingIndex !== -1) {
        // Update existing entry
        moodHistory[existingIndex] = { date: today, mood: selectedMood, notes };
    } else {
        // Add new entry
        moodHistory.unshift({ date: today, mood: selectedMood, notes });
        
        // Keep only last 7 entries
        if (moodHistory.length > 7) {
            moodHistory.pop();
        }
    }
    
    // Save to localStorage
    localStorage.setItem('moodHistory', JSON.stringify(moodHistory));
    
    // Update UI
    loadMoodHistoryChart();
    
    // Reset form
    moodOptions.forEach(opt => opt.classList.remove('selected'));
    selectedMood = null;
    moodNotes.value = '';
    
    showNotification('Mood saved successfully!', 'success');
}

function loadMoodHistoryChart() {
    moodHistoryChart.innerHTML = '';
    
    if (moodHistory.length === 0) {
        moodHistoryChart.innerHTML = '<p style="text-align: center; color: var(--gray-color);">No mood data yet. Start tracking your mood!</p>';
        return;
    }
    
    // Show last 7 entries
    const recentHistory = moodHistory.slice(0, 7);
    
    recentHistory.forEach(entry => {
        const moodBar = document.createElement('div');
        moodBar.className = 'mood-bar';
        
        // Set height based on mood
        const moodHeights = {
            'awful': '30%',
            'poor': '45%',
            'okay': '60%',
            'good': '75%',
            'great': '90%'
        };
        
        moodBar.style.height = moodHeights[entry.mood] || '50%';
        
        // Set color based on mood
        const moodColors = {
            'awful': '#f56565',
            'poor': '#ed8936',
            'okay': '#ecc94b',
            'good': '#48bb78',
            'great': '#38b2ac'
        };
        
        moodBar.style.backgroundColor = moodColors[entry.mood] || '#a0aec0';
        
        // Format date
        const dateObj = new Date(entry.date);
        const formattedDate = `${dateObj.getMonth()+1}/${dateObj.getDate()}`;
        
        moodBar.innerHTML = `<div class="mood-date">${formattedDate}</div>`;
        moodHistoryChart.appendChild(moodBar);
    });
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Add styles for notification
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                padding: 1rem 1.5rem;
                border-radius: var(--border-radius);
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-width: 300px;
                max-width: 400px;
                z-index: 3000;
                animation: slideIn 0.3s ease-out;
                border-left: 4px solid var(--primary-color);
            }
            
            .notification.error {
                border-left-color: var(--danger-color);
            }
            
            .notification.success {
                border-left-color: var(--success-color);
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }
            
            .notification-content i {
                font-size: 1.2rem;
            }
            
            .notification.error .notification-content i {
                color: var(--danger-color);
            }
            
            .notification.success .notification-content i {
                color: var(--success-color);
            }
            
            .notification-close {
                background: none;
                border: none;
                cursor: pointer;
                color: var(--gray-color);
                font-size: 1rem;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add close functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Setup scroll animations
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements to animate
    document.querySelectorAll('.tool-card, .resource-card').forEach(card => {
        observer.observe(card);
    });
    
    // Add animation styles
    const animationStyles = document.createElement('style');
    animationStyles.textContent = `
        .tool-card, .resource-card {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.5s ease, transform 0.5s ease;
        }
        
        .tool-card.animate-in, .resource-card.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(animationStyles);
}

// Crisis text button functionality
document.getElementById('crisisTextBtn')?.addEventListener('click', function() {
    if (confirm("Text HOME to 741741 to connect with a Crisis Counselor. Would you like to copy this number to your clipboard?")) {
        navigator.clipboard.writeText("HOME to 741741")
            .then(() => showNotification("Number copied to clipboard. Please text HOME to 741741 for help.", 'success'))
            .catch(() => showNotification("Please text HOME to 741741 for immediate crisis support.", 'info'));
    }
});