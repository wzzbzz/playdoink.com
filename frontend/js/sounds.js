
// --- Audio setup ---
const sounds = {
    doink: new Audio('resources/doink.mp3'),
    sproing: new Audio('resources/sproing2.mp3'),
    highscore: new Audio('resources/fanfare.mp3'),
    ding: new Audio('resources/ding.mp3'),
    highfive: new Audio('resources/highfive.mp3')
};

// Mute state management
let isMuted = localStorage.getItem('soundMuted') === 'true';

// Apply initial mute state
Object.values(sounds).forEach(sound => {
    sound.muted = isMuted;
});

// Mute button handler
$(document).ready(function() {
    const muteBtn = $('#mute-btn');
    const unmutedIcon = muteBtn.find('.mute-icon.unmuted');
    const mutedIcon = muteBtn.find('.mute-icon.muted');
    
    // Function to update icon display
    function updateMuteIcon() {
        if (isMuted) {
            unmutedIcon.hide();
            mutedIcon.show();
            muteBtn.addClass('muted');
        } else {
            unmutedIcon.show();
            mutedIcon.hide();
            muteBtn.removeClass('muted');
        }
    }
    
    // Set initial button state
    updateMuteIcon();
    
    // Toggle mute on click
    muteBtn.on('click', function() {
        isMuted = !isMuted;
        localStorage.setItem('soundMuted', isMuted);
        
        // Update all sounds
        Object.values(sounds).forEach(sound => {
            sound.muted = isMuted;
        });
        
        // Update button appearance
        updateMuteIcon();
    });
});

// Optional: when "doink" ends, trigger a new turn (for classic)
sounds.doink.addEventListener('ended', () => {
    if (currentGame && typeof currentGame.newTurn === "function") {
        currentGame.newTurn();
    }
});
