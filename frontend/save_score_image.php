<?php
header("Content-Type: application/json");
// save_score_image.php
function fail($code, $msg) { http_response_code($code); echo json_encode(["error" => $msg]); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail(405, "POST only");
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
$decoded = base64_decode($imgData, true);

// Only accept what the games actually send: a 600x315 PNG under 100 KB, for a sensible score.
// (Tightened 2026-11-10: before this, anyone could POST any bytes and they were saved as a .png.)
if (!preg_match('/^\d{1,5}$/', (string)$_POST['score'])) fail(400, "Bad score");
require_once __DIR__ . '/src/ScoreImage.php';
$serverDraws = ScoreImage::available();
if (!$serverDraws) {
    // Fallback when the server can't draw (no GD/FreeType): accept only a real 600x315 PNG under 100 KB.
    if ($decoded === false || strlen($decoded) > 100000) fail(400, "Bad image");
    $info = @getimagesizefromstring($decoded);
    if (!$info || $info[2] !== IMAGETYPE_PNG || $info[0] !== 600 || $info[1] !== 315) fail(400, "Bad image");
}

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
    "doink"     => ["title" => "DO!NK",     "file" => "score-",           "page" => "/",
                    "name" => [["DO!NK", "#2b8bf6"]]],
    "megadoink" => ["title" => "MEGADO!NK", "file" => "megadoink-score-", "page" => "/megadoink.html",
                    "name" => [["MEGA", "#2b8bf6"], ["DO!NK", "#000000"]]],
];
$gameKey = isset($_POST['game']) && isset($games[$_POST['game']]) ? $_POST['game'] : "doink";
$filename = $games[$gameKey]["file"] . $score . ".png";
$filePath = $dir . "/" . $filename;
if ($serverDraws) {
    // Normal case: the server draws the image itself and ignores what was uploaded,
    // so nobody can put their own picture up as a score image. (Redrawing also replaces any old junk.)
    file_put_contents($filePath, ScoreImage::png($score, $games[$gameKey]["name"]));
} elseif (!file_exists($filePath)) {
    // Fallback: the image for a given score is always the same, so never overwrite one that's already there.
    file_put_contents($filePath, $decoded);
}
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
