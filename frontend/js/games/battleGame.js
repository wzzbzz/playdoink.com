const battleGame = {
  name: "Battle DO!NK",
  state: { players: [], challengeId: null, status: "waiting" },
  description: "Challenge!  It's a battle of pure luck!",

  init() {
    this.state.challengeId = challengeId;
    if (!this.state.challengeId) {
      alert("No battle ID found.");
      return;
    }
    this.subscribe(this.state.challengeId);
    this.renderUI();
  },

  subscribe(challengeId) {
    const url = new URL('https://mercure.playdoink.com/.well-known/mercure');
    url.searchParams.append('topic', 'https://playdoink.com/challenge/' + challengeId);
    const eventSource = new EventSource(url, { withCredentials: true });

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Challenge update:", data);
      if (data.status === "active") {
        this.state.status = "active";
        sounds.ding.play();
        this.renderUI();
      }
    };
  },

  action(pick) {
    $.post(`/challenge/play/${this.state.challengeId}`, { move: pick.attr('id') });
  },

  renderUI() {
    $("#battle-status").text(this.state.status);
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



gameTypes.battle = battleGame;