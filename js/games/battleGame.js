const battleGame = {
  name: "Battle DO!NK",
  state: { players: [], challengeId: null, status: "waiting" },

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
  }
};

gameTypes.battle = battleGame;