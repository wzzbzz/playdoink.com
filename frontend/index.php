<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/autoload.php';

$doink = new Doink\Doink();

// header
include 'templates/header.php';

// app windows
include 'templates/intro-overlay.php';

// a popup for setting nickname 
include 'templates/nickname-overlay.php';

// the Doink console 
include 'templates/game-console.php';

// the menu page 
include 'templates/game-menu.php';

// the leaderboard
include 'templates/leaderboard.php';

// stats page
include 'templates/stats.php';

// faq
include 'templates/faq.php';

// a chat app
include 'templates/chat-app.php';

// a page with a mercure subscription to shared events
include 'templates/room.php';

// footer
include 'templates/footer.php';
