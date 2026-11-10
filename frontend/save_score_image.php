<?php
header("Content-Type: application/json");
// save_score_image.php
if (!isset($_POST['image']) || !isset($_POST['score'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing data"]);
    exit;
}

$imgData = $_POST['image'];
$score = intval($_POST['score']);

// strip off the "data:image/png;base64," part
$imgData = str_replace('data:image/png;base64,', '', $imgData);
$imgData = str_replace(' ', '+', $imgData);
$decoded = base64_decode($imgData);

// make sure directory exists
$dir = __DIR__ . "/scores";
if (!file_exists($dir)) {
    mkdir($dir, 0755, true);
}

// check the directory to see if it was created
if (!file_exists($dir)) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to create directory"]);
    
    exit;
}
// check to see if it's writeable
if (!is_writable($dir)) {
    http_response_code(500);
    
    // echo some json data saying directory is not writable
    echo json_encode(["error" => "Directory not writable"]);
    exit;
}

// Which game the share is for (Doink by default). Only these names are accepted.
$games = [
    "doink"     => ["title" => "DO!NK",     "file" => "score-",           "page" => "/"],
    "megadoink" => ["title" => "MEGADO!NK", "file" => "megadoink-score-", "page" => "/megadoink.html"],
];
$gameKey = isset($_POST['game']) && isset($games[$_POST['game']]) ? $_POST['game'] : "doink";
$filename = $games[$gameKey]["file"] . $score . ".png";
$filePath = $dir . "/" . $filename;
file_put_contents($filePath, $decoded);
// verify the file was saved
if (!file_exists($filePath)) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to save image"]);
    exit;
}

// public URL (adjust to your domain)
// Links and images must point at the game's own site (doink.playdoink.com),
// not the playdoink.com hub, or link previews come up blank.
$host = $_SERVER['HTTP_HOST'] ?? '';
$base = preg_match('/^[a-z0-9.:-]+$/i', $host) ? "https://" . $host : "https://doink.playdoink.com";
$imageUrl = $base . "/scores/" . $filename;
$gameUrl = $base . $games[$gameKey]["page"];


echo json_encode(["url" => $imageUrl, "gameUrl" => $gameUrl]);
exit;
?>
