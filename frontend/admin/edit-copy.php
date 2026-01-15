<?php
require_once __DIR__ . '/../autoload.php';

use Doink\Copy;

$message = '';
$messageType = '';

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $newCopy = [];
    
    // Site section
    $newCopy['site'] = [
        'name' => $_POST['site_name'] ?? '',
        'tagline' => $_POST['site_tagline'] ?? '',
        'version_prefix' => $_POST['site_version_prefix'] ?? ''
    ];
    
    // Homepage section
    $gameDesc = $_POST['homepage_game_description'] ?? '';
    $gameDescLines = array_filter(array_map('trim', explode("\n", $gameDesc)));
    
    $newCopy['homepage'] = [
        'heading' => $_POST['homepage_heading'] ?? '',
        'play_button' => $_POST['homepage_play_button'] ?? '',
        'play_subtext' => $_POST['homepage_play_subtext'] ?? '',
        'game_description' => $gameDescLines,
        'login_button' => $_POST['homepage_login_button'] ?? ''
    ];
    
    // Auth section
    $newCopy['auth'] = [
        'heading' => $_POST['auth_heading'] ?? '',
        'subtitle' => $_POST['auth_subtitle'] ?? '',
        'email_placeholder' => $_POST['auth_email_placeholder'] ?? '',
        'submit_button' => $_POST['auth_submit_button'] ?? '',
        'footer_text' => $_POST['auth_footer_text'] ?? '',
        'back_link' => $_POST['auth_back_link'] ?? ''
    ];
    
    // FAQ section
    $faqAnswer = $_POST['faq_answer'] ?? '';
    $faqAnswerLines = array_filter(array_map('trim', explode("\n", $faqAnswer)));
    
    $newCopy['faq'] = [
        'heading' => $_POST['faq_heading'] ?? '',
        'what_is_doink' => [
            'question' => $_POST['faq_question'] ?? '',
            'answer' => $faqAnswerLines
        ]
    ];
    
    // Game section
    $newCopy['game'] = [
        'you_got' => $_POST['game_you_got'] ?? '',
        'best_run' => $_POST['game_best_run'] ?? '',
        'play_again' => $_POST['game_play_again'] ?? '',
        'share_message' => $_POST['game_share_message'] ?? ''
    ];
    
    if (Copy::save($newCopy)) {
        $message = 'Copy saved successfully!';
        $messageType = 'success';
    } else {
        $message = 'Error saving copy.';
        $messageType = 'error';
    }
}

$copy = Copy::all();
?>
<!DOCTYPE html>
<html>
<head>
    <title>Edit Copy - DO!NK CMS</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * {
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        h1 {
            color: #2b8bf6;
            font-size: 2.5rem;
        }
        .message {
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 5px;
            font-weight: bold;
        }
        .message.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .message.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .section {
            background: white;
            padding: 25px;
            margin-bottom: 25px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .section h2 {
            margin-top: 0;
            color: #333;
            border-bottom: 2px solid #2b8bf6;
            padding-bottom: 10px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            font-weight: 600;
            margin-bottom: 5px;
            color: #555;
        }
        input[type="text"],
        textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            font-family: inherit;
        }
        textarea {
            min-height: 80px;
            resize: vertical;
        }
        .array-input {
            margin-bottom: 10px;
        }
        .array-input label {
            font-size: 0.9em;
            color: #666;
        }
        button {
            background: #2b8bf6;
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: background 0.2s;
        }
        button:hover {
            background: #1e6dd4;
        }
        .help-text {
            font-size: 0.85em;
            color: #666;
            margin-top: 5px;
        }
        .back-link {
            display: inline-block;
            margin-bottom: 20px;
            color: #2b8bf6;
            text-decoration: none;
        }
        .back-link:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <a href="../index.php" class="back-link">← Back to Site</a>
    
    <h1>DO!NK Copy Management</h1>
    
    <?php if ($message): ?>
        <div class="message <?= $messageType ?>"><?= htmlspecialchars($message) ?></div>
    <?php endif; ?>
    
    <form method="POST">
        
        <!-- Site Section -->
        <div class="section">
            <h2>Site</h2>
            <div class="form-group">
                <label for="site_name">Site Name</label>
                <input type="text" id="site_name" name="site_name" 
                       value="<?= htmlspecialchars($copy['site']['name'] ?? '') ?>">
            </div>
            <div class="form-group">
                <label for="site_tagline">Tagline</label>
                <input type="text" id="site_tagline" name="site_tagline" 
                       value="<?= htmlspecialchars($copy['site']['tagline'] ?? '') ?>">
            </div>
            <div class="form-group">
                <label for="site_version_prefix">Version Prefix</label>
                <input type="text" id="site_version_prefix" name="site_version_prefix" 
                       value="<?= htmlspecialchars($copy['site']['version_prefix'] ?? '') ?>">
            </div>
        </div>
        
        <!-- Homepage Section -->
        <div class="section">
            <h2>Homepage</h2>
            <div class="form-group">
                <label for="homepage_heading">Main Heading</label>
                <input type="text" id="homepage_heading" name="homepage_heading" 
                       value="<?= htmlspecialchars($copy['homepage']['heading'] ?? '') ?>">
            </div>
            <div class="form-group">
                <label for="homepage_play_button">Play Button Text</label>
                <input type="text" id="homepage_play_button" name="homepage_play_button" 
                       value="<?= htmlspecialchars($copy['homepage']['play_button'] ?? '') ?>">
            </div>
            <div class="form-group">
                <label for="homepage_play_subtext">Play Button Subtext</label>
                <input type="text" id="homepage_play_subtext" name="homepage_play_subtext" 
                       value="<?= htmlspecialchars($copy['homepage']['play_subtext'] ?? '') ?>">
            </div>
            <div class="form-group">
                <label for="homepage_game_description">Game Description (one line per line)</label>
                <textarea id="homepage_game_description" name="homepage_game_description" rows="4"><?= htmlspecialchars(implode("\n", $copy['homepage']['game_description'] ?? [])) ?></textarea>
                <div class="help-text">Each line will be displayed as a separate line</div>
            </div>
            <div class="form-group">
                <label for="homepage_login_button">Login/Register Button Text</label>
                <input type="text" id="homepage_login_button" name="homepage_login_button" 
                       value="<?= htmlspecialchars($copy['homepage']['login_button'] ?? '') ?>">
            </div>
        </div>
        
        <!-- Auth Section -->
        <div class="section">
            <h2>Authentication</h2>
            <div class="form-group">
                <label for="auth_heading">Heading</label>
                <input type="text" id="auth_heading" name="auth_heading" 
                       value="<?= htmlspecialchars($copy['auth']['heading'] ?? '') ?>">
            </div>
            <div class="form-group">
                <label for="auth_subtitle">Subtitle</label>
                <input type="text" id="auth_subtitle" name="auth_subtitle" 
                       value="<?= htmlspecialchars($copy['auth']['subtitle'] ?? '') ?>">
            </div>
            <div class="form-group">
                <label for="auth_email_placeholder">Email Placeholder</label>
                <input type="text" id="auth_email_placeholder" name="auth_email_placeholder" 
                       value="<?= htmlspecialchars($copy['auth']['email_placeholder'] ?? '') ?>">
            </div>
            <div class="form-group">
                <label for="auth_submit_button">Submit Button Text</label>
                <input type="text" id="auth_submit_button" name="auth_submit_button" 
                       value="<?= htmlspecialchars($copy['auth']['submit_button'] ?? '') ?>">
            </div>
            <div class="form-group">
                <label for="auth_footer_text">Footer Text</label>
                <textarea id="auth_footer_text" name="auth_footer_text"><?= htmlspecialchars($copy['auth']['footer_text'] ?? '') ?></textarea>
                <div class="help-text">Use &lt;br&gt; for line breaks</div>
            </div>
            <div class="form-group">
                <label for="auth_back_link">Back Link Text</label>
                <input type="text" id="auth_back_link" name="auth_back_link" 
                       value="<?= htmlspecialchars($copy['auth']['back_link'] ?? '') ?>">
            </div>
        </div>
        
        <!-- FAQ Section -->
        <div class="section">
            <h2>FAQ</h2>
            <div class="form-group">
                <label for="faq_heading">Heading</label>
                <input type="text" id="faq_heading" name="faq_heading" 
                       value="<?= htmlspecialchars($copy['faq']['heading'] ?? '') ?>">
            </div>
            <div class="form-group">
                <label for="faq_question">"What is Do!nk?" Question</label>
                <input type="text" id="faq_question" name="faq_question" 
                       value="<?= htmlspecialchars($copy['faq']['what_is_doink']['question'] ?? '') ?>">
            </div>
            <div class="form-group">
                <label for="faq_answer">Answer (one line per line)</label>
                <textarea id="faq_answer" name="faq_answer" rows="6"><?= htmlspecialchars(implode("\n", $copy['faq']['what_is_doink']['answer'] ?? [])) ?></textarea>
                <div class="help-text">Each line will be displayed as a separate line in the FAQ</div>
            </div>
        </div>
        
        <!-- Game Section -->
        <div class="section">
            <h2>Game Messages</h2>
            <div class="form-group">
                <label for="game_you_got">"You Got" Label</label>
                <input type="text" id="game_you_got" name="game_you_got" 
                       value="<?= htmlspecialchars($copy['game']['you_got'] ?? '') ?>">
            </div>
            <div class="form-group">
                <label for="game_best_run">"Best Run" Label</label>
                <input type="text" id="game_best_run" name="game_best_run" 
                       value="<?= htmlspecialchars($copy['game']['best_run'] ?? '') ?>">
            </div>
            <div class="form-group">
                <label for="game_play_again">Play Again Button Text</label>
                <input type="text" id="game_play_again" name="game_play_again" 
                       value="<?= htmlspecialchars($copy['game']['play_again'] ?? '') ?>">
            </div>
            <div class="form-group">
                <label for="game_share_message">Share Message</label>
                <input type="text" id="game_share_message" name="game_share_message" 
                       value="<?= htmlspecialchars($copy['game']['share_message'] ?? '') ?>">
                <div class="help-text">Use {score} as a placeholder for the actual score</div>
            </div>
        </div>
        
        <button type="submit">Save All Changes</button>
        
    </form>
    
</body>
</html>
