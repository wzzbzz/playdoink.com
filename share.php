<?php
$score = isset($_GET['score']) ? intval($_GET['score']) : 0;

// build image + page URLs
$imgUrl  = "https://playdoink.com/scores/score-" . $score . ".png";
$pageUrl = "https://playdoink.com/share.php?img=" . urlencode($img) . "&score=" . $score;
$gameUrl = "https://playdoink.com/"; // <-- your actual game link

?>
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>I scored <?= $score ?> in DO!NK!</title>

  <!-- Open Graph -->
  <meta property="og:title" content="DO!NK" />
  <meta property="og:description" content="" />
  <meta property="og:image" content="<?= $imgUrl ?>" />
  <meta property="og:url" content="<?= $pageUrl ?>" />
  <meta property="og:type" content="website" />

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
