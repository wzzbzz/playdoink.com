<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/autoload.php';

$doink = new Doink\Doink();

include 'templates/header.php';
include 'templates/intro-overlay.php';
include 'templates/nickname-overlay.php';
include 'templates/game-console.php';
include 'templates/game-menu.php';
include 'templates/leaderboard.php';
include 'templates/stats.php';
include 'templates/faq.php';
include 'templates/chat-app.php';
include 'templates/room.php';
include 'templates/footer.php';
