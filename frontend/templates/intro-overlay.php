<?php 
global $doink; 
use Doink\Copy;
?>
<div id="intro-overlay" class="overlay">

    <div id="auth-container" class="container auth-container" style="display:none;">
        <div class="auth-card">
            <h2><?= Copy::get('auth.heading') ?></h2>
            <p class="auth-subtitle"><?= Copy::get('auth.subtitle') ?></p>
            
            <form id="auth-form" class="auth-form">
                <input 
                    type="email" 
                    id="email-input" 
                    placeholder="<?= Copy::get('auth.email_placeholder') ?>" 
                    required
                    autocomplete="email"
                />
                <button type="submit" id="auth-submit-btn" class="btn">
                    <?= Copy::get('auth.submit_button') ?>
                </button>
            </form>
            
            <div id="auth-message" class="auth-message"></div>
            
            <p class="auth-footer">
                <?= Copy::get('auth.footer_text') ?>
            </p>

            <div class="auth-legal-links">
                <a href="/terms.php" target="_blank">Terms of Use</a>
                <span>•</span>
                <a href="/privacy.php" target="_blank">Privacy Policy</a>
            </div>
            
            <p class="toggle-text">
                <a href="#" id="back-to-intro"><?= Copy::get('auth.back_link') ?></a>
            </p>
        </div>
    </div>

    <!-- Register container removed - magic link handles both login and register -->


    <div id="intro-container" class="container intro-container">
        <h1><?= Copy::get('homepage.heading') ?></h1>
        <div class="version-info">
            <small><?= Copy::get('site.version_prefix') ?> <?php echo htmlspecialchars($doink->getVersion(), ENT_QUOTES, 'UTF-8'); ?></small>
        </div>

        <a href="#" id="play-now" class="btn play"><?= Copy::get('homepage.play_button') ?></a>
        <div class="subtext"><?= Copy::get('homepage.play_subtext') ?></div>

        <hr style="margin:1em 0;">

        <a href="#" id="login-register" class="btn login-register" data-mode="page"><?= Copy::get('homepage.login_button') ?></a>
        <div class="subtext">
            <?php foreach (Copy::get('homepage.game_description') as $line): ?>
                <?= $line ?><br>
            <?php endforeach; ?>
        </div>

        <!-- <a href="#login" class="btn login">LOGIN</a>
            <div class="subtext">
                Not a member? <a href="#register">REGISTER FOR FREE</a> to track your high scores and compete for Winner
                Status!
            </div> -->

    </div>
</div>