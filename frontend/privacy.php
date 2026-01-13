<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/autoload.php';

$doink = new Doink\Doink();
$doink->setTitle('Privacy Policy - Doink');
$doink->setDescription('Privacy Policy for Doink game');
?>
<!DOCTYPE html>
<html>
<head>
    <title><?php $doink->title(); ?></title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/x-icon" href="<?php $doink->faviconUrl(); ?>">
    <link rel="stylesheet" href="css/main.css?v=<?= $doink->cacheBust() ?>">
    <link rel="stylesheet" href="css/legal.css?v=<?= $doink->cacheBust() ?>">
    <style>
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 2rem 0;
        }
    </style>
</head>
<body>
    <div style="max-width: 800px; margin: 0 auto;">
        <a href="/" style="color: white; text-decoration: none; display: inline-block; margin-bottom: 1rem; padding: 0.5rem 1rem; background: rgba(0,0,0,0.3); border-radius: 4px;">← Back to Game</a>
    </div>
    
    <?php include 'templates/privacy.php'; ?>

</body>
</html>
