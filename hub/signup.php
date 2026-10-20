<?php

// Shared email signup for the playdoink.com home page.
// Appends one line per new address to a CSV kept outside the web root.
// Override the location with the PLAYDOINK_SIGNUPS_FILE environment variable.

header('Content-Type: application/json');

function reply($ok, $error = null, $status = 200) {
    http_response_code($status);
    echo json_encode($error ? ['ok' => $ok, 'error' => $error] : ['ok' => $ok]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    reply(false, 'Use POST.', 405);
}

// honeypot: real people leave this hidden field empty
if (!empty($_POST['website'])) {
    reply(true);
}

$email = strtolower(trim($_POST['email'] ?? ''));
if (strlen($email) > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    reply(false, 'Please enter a valid email address.', 400);
}

$file = getenv('PLAYDOINK_SIGNUPS_FILE') ?: dirname(__DIR__, 2) . '/data/signups.csv';
$dir = dirname($file);
if (!is_dir($dir) && !mkdir($dir, 0750, true)) {
    reply(false, 'Signup is not available right now.', 500);
}

$fh = fopen($file, 'c+');
if (!$fh || !flock($fh, LOCK_EX)) {
    reply(false, 'Signup is not available right now.', 500);
}

// skip addresses already on the list
while (($row = fgetcsv($fh)) !== false) {
    if (($row[0] ?? '') === $email) {
        flock($fh, LOCK_UN);
        fclose($fh);
        reply(true);
    }
}

fseek($fh, 0, SEEK_END);
fputcsv($fh, [$email, gmdate('c'), 'home']);
fflush($fh);
flock($fh, LOCK_UN);
fclose($fh);

reply(true);
