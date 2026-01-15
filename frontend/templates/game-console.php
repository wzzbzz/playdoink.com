<?php use Doink\Copy; ?>
    <div id="game-console" class="overlay" style="display:<?php echo $showRoom ? 'none' : 'block'; ?>;">
        <div id="game_head">
            <h1 id="doink_title"><?= Copy::get('site.name') ?></h1>
            <div id="marquee_message"></div>
            <button id="menu-btn" class="menu-button">☰</button>
        </div>

        <div id="endgame_modal" class="modal">
            <div id="results">
                <div><?= Copy::get('game.you_got') ?> <span id="yourscore"></span></div>
                <div><?= Copy::get('game.best_run') ?> <span id="bestrun"></span></div>
                <div class="">
                    <button id="playagain"><?= Copy::get('game.play_again') ?></button>
                </div>
                <div id="share-buttons-container" style="margin-top:1em;"></div>
            </div>
        </div>

        <div id = "buttons" class="doink_machine container">
            <div class="single_button_wrap">
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
            <div class="single_button_wrap">
                <svg class="svgbutton" id="2" width="200" height="200">
                    <g fill="url(#grad1)">
                        <circle cx="100" cy="100" r="75" stroke="#bbb" stroke-width="5" />
                    </g>
                </svg>
            </div>
        </div>
        <canvas id="scoreCanvas" 
                width="600" 
                height="315" 
                style="display:none"
                data-share-message="<?= Copy::get('game.share_message') ?>"
                data-site-name="<?= Copy::get('site.name') ?>">
        </canvas>
    </div>
