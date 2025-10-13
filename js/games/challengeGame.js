const challengeGame = {
    name: "Challenge DO!NK",
    state: { player: null, rounds: 0, score: 0, target: 50, winner: null },

    init() {
        this.state.player = $.cookie("doink_username") || prompt("Enter your name:");
        if (this.state.player) $.cookie("doink_username", this.state.player, { expires: 7 });
            alert(`Welcome, ${this.state.player}! Prepare to enter battle`);
        this.startChallenge();
    },

    startChallenge() {
        this.state.rounds = 0;
        this.state.score = 0;
        this.newTurn();
        this.renderUI();
    },

    newTurn() {
        this.state.winner = Math.random() > 0.5 ? "1" : "2";
        resetButtons(); // ✅ reset colors
    },

    action(pick) {
        this.state.rounds++;
        if (pick.attr('id') == this.state.winner) {
            this.state.score++;
            styleGoodPick(pick);
            sounds.doink.play();
        } else {
            styleBadPick(pick);
            sounds.sproing.play();
        }
        this.newTurn();
        this.renderUI();

        if (this.state.score >= this.state.target) {
            this.showResult();
        }
    },


    showResult() {
        alert(`You reached ${this.state.target} in ${this.state.rounds} rounds!`);
        // TODO: share link or backend call
    },

    renderUI() {
        $("#player-name").text(this.state.player);
        $("#score").text(this.state.score);
        $("#rounds").text(this.state.rounds);
    }
};

gameTypes.challenge = challengeGame;