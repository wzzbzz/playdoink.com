// presence.js

// roomId is in the GET
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get("room") || "homescreen";
let user = null;
let heartbeat;


/* chat adds a chat message to the list */
function addMessage(user, message) {
    const msgBox = document.getElementById("chat-messages");
    const div = document.createElement("div");
    div.textContent = user + ": " + message;
    msgBox.appendChild(div);
    msgBox.scrollTop = msgBox.scrollHeight;
}

/* Shows a list of the users in the room */
function updateUserList(users) {
    const userList = document.getElementById("chat-users");
    userList.innerHTML = "";
    users.forEach(u => {
        const li = document.createElement("li");
        li.textContent = u;
        userList.appendChild(li);
    });
}



function initChat(nickname) {
    user = nickname;


    const url = new URL("https://mercure.playdoink.com/.well-known/mercure");
    url.searchParams.append("topic", `https://playdoink.com/rooms/${roomId}`);
    const eventSource = new EventSource(url);

    // Tell backend we've joined
    fetch(`https://app.playdoink.com/join/${roomId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            user
        })
    });

    // Keep alive
    heartbeat = setInterval(() => {
        fetch(`https://app.playdoink.com/ping/${roomId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user
            })
        });
    }, 15000);

    // Listen to Mercure events
    eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.event === "user_joined") {
            addMessage("SYSTEM", data.user + " joined");
            if (roomId === "colosseum") {
                showFlashMessage(data.user + " has joined the colosseum!", 3000);
            }

        } else if (data.event === "user_left") {
            addMessage("SYSTEM", data.user + " left");
            if (roomId === "colosseum") {
                showFlashMessage(data.user + " has left the colosseum.", 3000);
                // remove from players list
                delete players[data.user];
            }
        } else if (data.message) {
            addMessage(data.user, data.message);
        } else if (data.event === "user_doinked") {
            addMessage("SYSTEM", data.user + "goes DO!NK!!!");
            // Trigger Doink animation/sound here
            sounds.doink.play();
        } else if (data.event === "user_highfived") {
            addMessage("SYSTEM", data.source + " high-fived " + data.target + " ✋");
            doHighFive(data);
        }
        if (data.users) {
            updateUserList(data.users);
            if (roomId === "colosseum") {
                data.users.forEach(function (u) {
                    addPlayer(u); // add new user to the colosseum
                });
            }
        }
    };

    // Send messages
    document.getElementById("chat-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const text = document.getElementById("chat-input").value;
        if (!text) return;
        await fetch(`https://app.playdoink.com/message/${roomId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user,
                message: text
            })
        });
        document.getElementById("chat-input").value = "";
    });

    document.getElementById("doink-btn").addEventListener("click", async () => {
        await fetch(`https://app.playdoink.com/doink/${roomId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user
            })
        });
    });

    // Handle leaving
    window.addEventListener("beforeunload", () => {
        clearInterval(heartbeat);
        navigator.sendBeacon(`https://app.playdoink.com/leave/${roomId}`, JSON.stringify({
            user: user,
        }));
    });
}

// Check if nickname exists in cookie
const savedName = getCookie("doink_nickname");

if (savedName) {
    document.getElementById("nickname-overlay").style.display = "none";
    initChat(savedName);
} else {
    document.getElementById("nickname-btn").addEventListener("click", () => {
        const nickname = document.getElementById("nickname-input").value.trim();
        if (!nickname) return;
        setCookie("doink_nickname", nickname, 7); // save for 7 days
        document.getElementById("nickname-overlay").style.display = "none";
        initChat(nickname);
    });
}