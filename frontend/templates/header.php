<?php global $doink;
?><!DOCTYPE html>

<head>
    <title><?= htmlspecialchars($doink->title()) ?></title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta property="og:title" content="<?= htmlspecialchars($doink->title()) ?>">
    <meta property="og:description" content="<?= htmlspecialchars($doink->description()) ?>">
    <meta property="og:image" content="<?= htmlspecialchars($doink->ogImageUrl()) ?>">
    <meta property="og:url" content="<?= htmlspecialchars($doink->ogUrl()) ?>">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary_large_image">

    <link id="favicon" rel="icon" type="image/x-icon" href="<?= htmlspecialchars($doink->faviconUrl()) ?>">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Luckiest+Guy&family=Spicy+Rice&display=swap" rel="stylesheet">


    <!-- TBD, set up SCSS processing / minimizing and builds and all that-->
    <link rel="stylesheet" href="css/main.css?v=<?= $doink->cacheBust() ?>">
    <link rel="stylesheet" href="css/intro-screen.css?v=<?= $doink->cacheBust() ?>">
    <link rel="stylesheet" href="css/game.css?v=<?= $doink->cacheBust() ?>">
    <link rel="stylesheet" href="css/share.css?v=<?= $doink->cacheBust() ?>">
    <link rel="stylesheet" href="css/colosseum.css?v=<?= $doink->cacheBust() ?>">
    <link rel="stylesheet" href="css/legal.css?v=<?= $doink->cacheBust() ?>">

</head>

<body>