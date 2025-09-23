<?php
$challenge_id = $_GET['challenge'] ?? null;
?><!DOCTYPE html>

<head>
    <title>DO!NK</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta property="og:title" content="DO!NK">
    <meta property="og:description" content="Join the battle!">
    <meta property="og:image" content="https://playdoink.com/resources/doink-image.png">
    <meta property="og:url" content="https://playdoink.com">
    <meta property="og:type" content="website">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Luckiest+Guy&family=Spicy+Rice&display=swap" rel="stylesheet">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"
        integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.4.1/jquery.cookie.min.js"></script>

    <!-- TBD, set up SCSS processing / minimizing and builds and all that-->
    <link rel="stylesheet" href="css/main.css">
    <link rel="stylesheet" href="css/intro-screen.css">
    <link rel="stylesheet" href="css/game.css">
    <link rel="stylesheet" href="css/share.css">

</head>

<body>
    <div id="intro-overlay" class="overlay">
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

            <a href="#" id="play-now" class="btn play">PLAY NOW!</a>
            <div class="subtext">Unlimited FREE play!</div>

            <!-- <a href="#login" class="btn login">LOGIN</a>
            <div class="subtext">
                Not a member? <a href="#register">REGISTER FOR FREE</a> to track your high scores and compete for Winner
                Status!
            </div> -->
        </div>
    </div>

    <div id="wrap">
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

    <script src="js/main.js"></script>
</body>
</html>