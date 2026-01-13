<?php global $doink; ?>
<div id="intro-overlay" class="overlay">

    <div id="auth-container" class="container auth-container" style="display:none;">
        <div class="auth-card">
            <h2>DO!NK</h2>
            <p class="auth-subtitle">Join the battle!</p>
            
            <form id="auth-form" class="auth-form">
                <input 
                    type="email" 
                    id="email-input" 
                    placeholder="Enter your email" 
                    required
                    autocomplete="email"
                />
                <button type="submit" id="auth-submit-btn" class="btn">
                    Send Magic Link
                </button>
            </form>
            
            <div id="auth-message" class="auth-message"></div>
            
            <p class="auth-footer">
                We'll send you a link to login instantly.<br>
                No password needed!
            </p>
            
            <p class="toggle-text">
                <a href="#" id="back-to-intro">← Back</a>
            </p>
        </div>
    </div>

    <!-- Register container removed - magic link handles both login and register -->


    <div id="intro-container" class="container intro-container">
        <h1>DO!NK</h1>
        <div class="version-info">
            <small>Version: <?php echo htmlspecialchars($doink->getVersion(), ENT_QUOTES, 'UTF-8'); ?></small>
        </div>

        <a href="#" id="play-now" class="btn play">PLAY NOW!</a>
        <div class="subtext">Unlimited FREE play!</div>

        <hr style="margin:1em 0;">

        <a href="#" id="login-register" class="btn login-register" data-mode="page">LOGIN/REGISTER</a>
        <div class="subtext">
            Press a button.<br>
            Hope it's green.<br>
            If it's red, the game ends.<br>

        </div>

        <!-- <a href="#login" class="btn login">LOGIN</a>
            <div class="subtext">
                Not a member? <a href="#register">REGISTER FOR FREE</a> to track your high scores and compete for Winner
                Status!
            </div> -->

    </div>
</div>