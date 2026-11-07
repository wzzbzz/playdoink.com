<?php
$score = isset($_GET['score']) ? intval($_GET['score']) : 0;

// Links and images must point at the game's own site (doink.playdoink.com),
// not the playdoink.com hub, or link previews come up blank.
$host = $_SERVER['HTTP_HOST'] ?? '';
$base = preg_match('/^[a-z0-9.:-]+$/i', $host) ? "https://" . $host : "https://doink.playdoink.com";

// build image + page URLs
$imgUrl  = $base . "/scores/score-" . $score . ".png";
$pageUrl = $base . "/share.php?score=" . $score;
$gameUrl = $base . "/";

?>
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>I scored <?= $score ?> in DO!NK!</title>

  <!-- Open Graph -->
  <meta property="og:title" content="DO!NK" />
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
