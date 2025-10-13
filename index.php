<?php
$challenge_id = $_GET['challenge'] ?? null;

$baseurl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]";
$appurl = "https://localhost:8000"; // For local dev


$cache_bust = "v=20240610.2"; // Change this to bust cache on new deploys

$room = $_GET['room'] ?? null;
if ($room) {
    if ($room == "colosseum") {
        $showColosseum = true;
    } // show the room  chat interface
    else {
        $showRoom = true;
    }
}

?>
<!DOCTYPE html>

<head>
    <title>DO!NK</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta property="og:title" content="DO!NK">
    <meta property="og:description" content="Join the battle!">
    <meta property="og:image" content="https://playdoink.com/resources/doink-opengraph.png">
    <meta property="og:url" content="https://playdoink.com">
    <meta property="og:type" content="website">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Luckiest+Guy&family=Spicy+Rice&display=swap" rel="stylesheet">


    <!-- TBD, set up SCSS processing / minimizing and builds and all that-->
    <link rel="stylesheet" href="css/main.css?v=<?= $cache_bust ?>">
    <link rel="stylesheet" href="css/intro-screen.css?v=<?= $cache_bust ?>">
    <link rel="stylesheet" href="css/game.css?v=<?= $cache_bust ?>">
    <link rel="stylesheet" href="css/share.css?v=<?= $cache_bust ?>">
    <link rel="stylesheet" href="css/colosseum.css?v=<?= $cache_bust ?>">

</head>

<body>
    <div id="intro-overlay" class="overlay" style="display:<?php echo ($showRoom | $showColosseum) ? 'none' : 'block'; ?>;">

        <div class="container auth-container" style="display:none;">
            <div class="auth-card">
                <h2 id="form-title">Login</h2>
                <form id="auth-form">
                    <input type="text" id="username" placeholder="Username" required />
                    <input type="password" id="password" placeholder="Password" required />
                    <button type="submit">Login</button>
                </form>
                <p class="toggle-text">
                    Don’t have an account? <a href="#" id="toggle-link">Register here</a>
                </p>
            </div>
        </div>

        <div class="container intro-container">
            <h1>DO!NK</h1>
            <div class="version-info">
                <small>Version: <?php echo htmlspecialchars($cache_bust, ENT_QUOTES, 'UTF-8'); ?></small>
            </div>

            <a href="#" id="play-now" class="btn play">PLAY NOW!</a>
            <div class="subtext">Unlimited FREE play!</div>

            <hr style="margin:1em 0;">

            <a href="#" id="create-challenge" class="btn challenge">CREATE CHALLENGE</a>
            <div class="subtext">
                Share the link with a friend to play head-to-head.
                <br>
                <small id="challenge-link" style="display:none;"></small>
            </div>

            <!-- <a href="#login" class="btn login">LOGIN</a>
            <div class="subtext">
                Not a member? <a href="#register">REGISTER FOR FREE</a> to track your high scores and compete for Winner
                Status!
            </div> -->

        </div>
    </div>

    <div id="nickname-overlay" style="position:absolute;top:0;left:0;width:100%;height:100%;background:#fff;display:flex;align-items:center;justify-content:center;z-index:10;">
        <div style="text-align:center;">
            <h2>Enter a nickname to join</h2>
            <input type="text" id="nickname-input" placeholder="Your nickname" style="padding:8px;" />
            <button id="nickname-btn">Join Chat</button>
        </div>
    </div>

    <div id="colosseum" class="overlay" style="display:<?php echo $showColosseum ? 'block' : 'none'; ?>;">
        <div id="game-container" class="game-container">
            <!-- The game canvas -->
            <canvas id="arena"></canvas>

            <div id="flash-message" class="flash-message"></div>

            <!-- Invisible clickable hitboxes -->
            <div id="sprite-green" class="sprite-hitbox"></div>
            <div id="sprite-red" class="sprite-hitbox"></div>


            <!-- Context menu -->
            <div id="sprite-menu" class="sprite-menu">
                <div class="menu-item">Look</div>
                <div class="menu-item">Challenge</div>
                <div class="menu-item">High Five</div>
            </div>
        </div>

        <script>
            
        </script>
    </div>

    <div id="chat-overlay" class="overlay" style="display:<?php echo ($showRoom) ? 'block' : 'none'; ?>;">
        <div class="chat-room">
            <!-- <canvas id="chat-room-canvas" width="800" height="400" style="border:1px solid #000;"></canvas> -->

            <!-- Messages -->
            <div id="chat-messages" style="height: 200px; overflow-y: auto; border: 1px solid #ccc; margin-top: 10px; padding: 10px;"></div>

            <!-- Input -->
            <form id="chat-form" style="margin-top: 10px;">
                <input type="text" id="chat-input" placeholder="Type your message..." style="width: 80%;" required />
                <button type="submit" style="width: 18%;">Send</button>
            </form>
            <button id="doink-btn" style="width: 18%;">Doink</button>


            <!-- User list -->
            <h3>Users in room:</h3>
            <ul id="chat-users"></ul>
        </div>

        <script>
            const roomId = "<?= $room ?>";
            let user = null;
            let heartbeat;

            function addMessage(user, message) {
                const msgBox = document.getElementById("chat-messages");
                const div = document.createElement("div");
                div.textContent = user + ": " + message;
                msgBox.appendChild(div);
                msgBox.scrollTop = msgBox.scrollHeight;
            }

            function updateUserList(users) {
                const userList = document.getElementById("chat-users");
                userList.innerHTML = "";
                users.forEach(u => {
                    const li = document.createElement("li");
                    li.textContent = u;
                    userList.appendChild(li);
                });
            }

            function setCookie(name, value, days) {
                const d = new Date();
                d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
                let expires = "expires=" + d.toUTCString();
                document.cookie = name + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";
            }

            function getCookie(name) {
                const cname = name + "=";
                const decoded = decodeURIComponent(document.cookie);
                const ca = decoded.split(';');
                for (let i = 0; i < ca.length; i++) {
                    let c = ca[i].trim();
                    if (c.indexOf(cname) === 0) {
                        return c.substring(cname.length, c.length);
                    }
                }
                return "";
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
                            data.users.forEach(function(u) {
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
        </script>
    </div>


    <div id="wrap" class="overlay" style="display:<?php echo $showRoom ? 'none' : 'block'; ?>;">
        <h1>DO!NK</h1>
        <div id="endwrap">
            <div id="end">
                <div>YOU GOT: <span id="yourscore"></span></div>
                <div>BEST RUN: <span id="bestrun"></span></div>
                <div class="">
                    <button id="playagain">PLAY AGAIN</button>
                </div>
                <div id="share-buttons-container" style="margin-top:1em;"></div>
            </div>
        </div>

        <div class="container">
            <div class="buttonwrap">
                <svg class="svgbutton" id="1" width="200" height="200">
                    <defs>
                        <linearGradient id="grey" x1="0" y1="20%" x2="0" y2="100%">
                            <stop offset="0" stop-color="#fff" />
                            <stop offset="1" stop-color="#bbb" />
                        </linearGradient>
                        <linearGradient id="grad2" x1="0" y1="20%" x2="0" y2="100%">
                            <stop offset="0" stop-color="#bbb" />
                            <stop offset="1" stop-color="#fff" />
                        </linearGradient>
                        <linearGradient id="red" x1="0" y1="20%" x2="0" y2="100%">
                            <stop offset="0" stop-color="#fb9fa1" />
                            <stop offset="1" stop-color="#af1620" />
                        </linearGradient>
                        <linearGradient id="green" x1="0" y1="20%" x2="0" y2="1">
                            <stop offset="0" stop-color="#7efb7f" />
                            <stop offset="1" stop-color="#16871a" />
                        </linearGradient>
                    </defs>
                    <g fill="url(#grad1)">
                        <circle cx="100" cy="100" r="75" stroke="#bbb" stroke-width="5" />
                    </g>
                </svg>
            </div>
            <div class="buttonwrap">
                <svg class="svgbutton" id="2" width="200" height="200">
                    <g fill="url(#grad1)">
                        <circle cx="100" cy="100" r="75" stroke="#bbb" stroke-width="5" />
                    </g>
                </svg>
            </div>
        </div>
    </div>

    <canvas id="scoreCanvas" width="600" height="315" style="display:none"></canvas>

    <!-- jQuery and cookie lib (must be before your scripts) -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"
        integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.4.1/jquery.cookie.min.js"></script>

    <!-- Your shared sounds, utils -->
    <script src="js/utils.js"></script>

    <script src="js/rooms/colosseum.js"></script>

    <!-- Core game engine -->
    <script src="js/gameEngine.js"></script>

    <!-- Each game type -->
    <script src="js/games/classicGame.js"></script>
    <script src="js/games/challengeGame.js"></script>
    <script src="js/games/battleGame.js"></script>

    <!-- Entry point -->
    <script src="js/main.js"></script>
</body>

</html>