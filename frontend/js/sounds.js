
// --- Audio setup ---
const sounds = {
    doink: new Audio('resources/doink.mp3'),
    sproing: new Audio('resources/sproing2.mp3'),
    highscore: new Audio('resources/fanfare.mp3'),
    ding: new Audio('resources/ding.mp3'),
    highfive: new Audio('resources/highfive.mp3')
};

// Optional: when "doink" ends, trigger a new turn (for classic)
sounds.doink.addEventListener('ended', () => {
    if (currentGame && typeof currentGame.newTurn === "function") {
        currentGame.newTurn();
    }
});
