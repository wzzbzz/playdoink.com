<?php
$score = isset($_GET['score']) ? intval($_GET['score']) : 0;

// Links and images must point at the game's own site (doink.playdoink.com),
// not the playdoink.com hub, or link previews come up blank.
$host = $_SERVER['HTTP_HOST'] ?? '';
$base = preg_match('/^[a-z0-9.:-]+$/i', $host) ? "https://" . $host : "https://doink.playdoink.com";

// Which game the share is for (Doink by default). Only these names are accepted.
$games = [
    "doink"     => ["title" => "DO!NK",     "file" => "score-",           "page" => "/"],
    "megadoink" => ["title" => "MEGADO!NK", "file" => "megadoink-score-", "page" => "/megadoink.html"],
];
$gameKey = isset($_GET['game']) && isset($games[$_GET['game']]) ? $_GET['game'] : "doink";
$game = $games[$gameKey];
$gameParam = $gameKey === "doink" ? "" : "&game=" . $gameKey;

// build image + page URLs
$imgUrl  = $base . "/scores/" . $game["file"] . $score . ".png";
$pageUrl = $base . "/share.php?score=" . $score . $gameParam;
$gameUrl = $base . $game["page"];

?>
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>I scored <?= $score ?> in <?= $game["title"] ?>!</title>

  <!-- Open Graph -->
  <meta property="og:title" content="<?= $game["title"] ?>" />
  <meta property="og:description" content="Can you beat my <?= $score ?>?" />
  <meta property="og:image" content="<?= $imgUrl ?>" />
  <meta property="og:url" content="<?= $pageUrl ?>" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="<?= $imgUrl ?>" />

  <script>
    // Redirect to the game URL immediately
    window.onload = function() {
        window.location.href = "<?= $gameUrl ?>";
    };
  </script>
</head>
<body>
</body>
</html>
