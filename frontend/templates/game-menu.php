    <div id="game-menu-overlay" class="overlay" style="display:none;">
        <div class="menu-container">
            <button id="close-menu" class="close-menu-btn">×</button>
            
            <h2>Menu</h2>
            
            <div class="menu-options">
                <button id="view-faq" class="menu-option-btn">
                    <span class="menu-icon">❓</span>
                    <span class="menu-text">DO?NK</span>
                </button>
                
                <button id="view-leaderboard" class="menu-option-btn">
                    <span class="menu-icon">🏆</span>
                    <span class="menu-text">Leaderboard</span>
                </button>
                
                <button id="view-stats" class="menu-option-btn">
                    <span class="menu-icon">📊</span>
                    <span class="menu-text">My Stats</span>
                </button>
                
                
                <button id="back-to-home" class="menu-option-btn">
                    <span class="menu-icon">🏠</span>
                    <span class="menu-text">Home</span>
                </button>
            </div>

            <!-- Legal Links -->
            <div class="legal-links">
                <a href="/terms.php" target="_blank">Terms of Use</a>
                <span>•</span>
                <a href="/privacy.php" target="_blank">Privacy Policy</a>
            </div>
        </div>
    </div>

    <style>
    .menu-button {
        position: fixed;
        top: 1rem;
        right: 0.5rem;
        font-family: Arial, sans-serif;
        font-size: 1.5rem;
        background: white;
        border: none;
        color: rgba(128, 128, 128, 0.6);
        width: 45px;
        height: 45px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
    }

    .menu-button:hover {
        background: rgba(128, 128, 128, 0.8);
        transform: scale(1.05);
    }

    #game-menu-overlay {
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(5px);
        padding: 2rem;
        box-sizing: border-box;
    }

    .menu-container {
        background: white;
        padding: 2rem;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        max-width: 400px;
        margin: 0 auto;
        position: relative;
        box-sizing: border-box;
    }

    .menu-container h2 {
        font-family: 'Luckiest Guy', cursive;
        font-size: 2.5rem;
        margin: 0 0 2rem 0;
        color: #2b8bf6;
        text-align: center;
    }

    .close-menu-btn {
        position: absolute;
        top: 1rem;
        right: 1rem;
        font-family: Arial, sans-serif;
        font-size: 2rem;
        background: none;
        border: none;
        color: #999;
        cursor: pointer;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s;
    }

    .close-menu-btn:hover {
        color: #333;
    }

    .menu-options {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .menu-option-btn {
        font-family: 'Luckiest Guy', cursive;
        font-size: 1.5rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 1rem 2rem;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .menu-option-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    }

    .menu-icon {
        font-size: 2rem;
    }

    .menu-text {
        flex: 1;
        text-align: left;
    }

    .legal-links {
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 1px solid #e0e0e0;
        text-align: center;
        font-family: Arial, sans-serif;
        font-size: 0.75rem;
    }

    .legal-links a {
        color: #999;
        text-decoration: none;
        transition: color 0.2s;
    }

    .legal-links a:hover {
        color: #667eea;
        text-decoration: underline;
    }

    .legal-links span {
        color: #ccc;
        margin: 0 0.5rem;
    }
    </style>
