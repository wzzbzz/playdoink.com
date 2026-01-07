const specatatorGame = {
    name: "Specator Mode",
    state: {},
    target: null, // what is better than target?
    eventSource: null,

    init(args) {
        // if target is not provied fail
        if (!args.target) {
            throw new Error("Spectator mode requires a target player to spectate.");
        }
        this.target = args.target;
        this.bindings();

        this.renderUI();
        disableButtons();
        this.subscribeToEvents();
        $("#results").hide();
    },

    subscribeToEvents() {
        const url = new URL(`https://mercure.playdoink.com/.well-known/mercure`);
        url.searchParams.append('topic', `https://playdoink.com/broadcast?room=${roomId}&player=${activeTarget.name}`);

        this.eventSource = new EventSource(url, { withCredentials: true });

        this.eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("Spectate update:", data);``
            if (data[0].event === 'user_doinked') {
                // get the button with buttonId
                let button = document.getElementById(data[0].buttonId);
                if(!button) return;
                button = $(button);
                console.log("Button DO!NKed:", button);
                if (data[0].result) {
                    styleGoodPick(button);
                    sounds.doink.play();
                }
                else{
                    styleBadPick(button);
                    sounds.sproing.play();
                }

            }
        };

        this.eventSource.onerror = () => {
            console.error("Error connecting to Mercure endpoint.");
            eventSource.close();
        };
    },

    unsubscribe() {
        // Unsubscribe from Mercure updates
        if (this.eventSource) {
            this.eventSource.close();
        }
    },

    renderUI() {
        $("#doink_title").addClass("small");
        this.setMessage("Spectating " + this.target);
    },

    setMessage(message) {
        // create a "stop" button and add it to the marquee message
        const stopButton = $('<button>').text("Stop Spectating").addClass("stop-button");
        $("#marquee_message").text(message).addClass("show");
        $("#marquee_message").append(stopButton);
    },

    bindings() {
        // Bind stop button
        $(document).on("click", ".stop-button", () => {
            this.stopButton();
        });

        sounds.doink.onended = () => {};
    },

    stopButton() {
        this.unsubscribe();
        $(document).off("click", ".stop-button");
        // remove stop button
        $(".stop-button").remove();
        $("#doink_title").removeClass("small");
        $("#marquee_message").removeClass("show");
        loadGame('classic');   // instead of startGame()
    }
}

gameTypes.spectator = specatatorGame;