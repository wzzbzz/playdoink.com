const classicGame = {
  name: "Classic DO!NK",
  state: { streak: 0, bestScore: 0, winner: null },

  init() {
    this.state.streak = 0;
    this.state.bestScore = (typeof $.cookie('doinkhighscore') === "undefined") ? 0 : $.cookie('doinkhighscore');
    sounds.doink.onended = () => {
      this.newTurn();
    };
    this.newTurn();
    this.renderUI();
    $("#end").hide();
  },

  newTurn() {
    enableButtons((button) => {
      this.action(button);
    });
    let num = Math.random();
    if (num < .4) this.state.winner = "1";
    else if (num < .8) this.state.winner = "2";
    else this.state.winner = true;

    resetButtons(); // ✅ now uses helper
  },

  action(pick) {
    if (this.state.winner === true || pick.attr('id') == this.state.winner) {
      this.goodPick(pick);
    } else {
      this.badPick(pick);
    }
  },

  goodPick(pick) {
    disableButtons();
    this.state.streak++;
    if (this.state.streak > this.state.bestScore) {
      this.state.bestScore = this.state.streak;
      $.cookie('doinkhighscore', this.state.bestScore);
    }
    $("#current-streak-value").text(this.state.streak);
    $("#best-score-value").text(this.state.bestScore);
    styleGoodPick(pick); // ✅ green
    sounds.doink.play();
    
  },

  badPick(pick) {
    styleBadPick(pick); // ✅ red
    sounds.sproing.play();
    setTimeout(() => {
      this.endGame();
    }, 250);
  },

  endGame() {
    if (this.state.streak > this.state.bestScore) {
        sounds.highscore.play();
    }
    showEndScreen(this.state.streak, this.state.bestScore);
  },

  renderUI() {
    $("#current-streak-value").text(this.state.streak);
    $("#best-score-value").text(this.state.bestScore);
  }
};

gameTypes.classic = classicGame;
