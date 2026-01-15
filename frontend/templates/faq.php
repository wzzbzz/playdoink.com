<?php use Doink\Copy; ?>
    <div id="faq-overlay" class="overlay" style="display:none;">
        <div class="faq-container">
            <button id="close-faq" class="close-btn">×</button>
            
            <h2><?= Copy::get('faq.heading') ?></h2>
            
            <div class="faq-content">
                <div class="faq-item">
                    <div class="faq-question"><?= Copy::get('faq.what_is_doink.question') ?></div>
                    <div class="faq-answer">
                        <?php foreach (Copy::get('faq.what_is_doink.answer') as $line): ?>
                            <?= $line ?><br>
                        <?php endforeach; ?>
                    </div>
                </div>
                
                <!-- <div class="faq-item">
                    <div class="faq-question">How do I save my progress?</div>
                    <div class="faq-answer">
                        Your progress is automatically saved to your account. Make sure you're logged in to keep your scores and stats.
                    </div>
                </div>
                
                <div class="faq-item">
                    <div class="faq-question">How does the leaderboard work?</div>
                    <div class="faq-answer">
                        The leaderboard shows the top players. There's a daily leaderboard that resets every day, and an all-time leaderboard for the best players ever.
                    </div>
                </div>
                
                <div class="faq-item">
                    <div class="faq-question">Can I change my nickname?</div>
                    <div class="faq-answer">
                        Yes! Go to your stats page where you can update your nickname and other profile settings.
                    </div>
                </div>
                
                <div class="faq-item">
                    <div class="faq-question">What if I forgot my login?</div>
                    <div class="faq-answer">
                        Click "Login/Register" and enter your email. We'll send you a magic link to log back in - no password needed!
                    </div>
                </div> -->
            </div>
        </div>
    </div>

    <style>
    #faq-overlay {
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(5px);
        padding: 2rem;
        box-sizing: border-box;
    }

    .faq-container {
        background: white;
        padding: 2rem;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        max-width: 700px;
        max-height: 80vh;
        overflow-y: auto;
        margin: 0 auto;
        position: relative;
        box-sizing: border-box;
    }

    .faq-container h2 {
        font-family: 'Luckiest Guy', cursive;
        font-size: 2.5rem;
        margin: 0 0 2rem 0;
        color: #2b8bf6;
        text-align: center;
    }

    .close-btn {
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

    .close-btn:hover {
        color: #333;
    }

    .faq-content {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .faq-item {
        background: #f8f9fa;
        border-radius: 12px;
        padding: 1.5rem;
        transition: all 0.2s;
        cursor: pointer;
    }

    .faq-item:hover {
        background: #e9ecef;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .faq-question {
        font-family: 'Luckiest Guy', cursive;
        font-size: 1.3rem;
        color: #2b8bf6;
        margin-bottom: 0.75rem;
    }

    .faq-answer {
        font-family: Arial, sans-serif;
        font-size: 1rem;
        color: #555;
        line-height: 1.6;
    }

    @media (max-width: 768px) {
        .faq-container {
            padding: 1.5rem;
            max-width: 100%;
        }

        .faq-container h2 {
            font-size: 2rem;
        }

        .faq-question {
            font-size: 1.1rem;
        }

        .faq-answer {
            font-size: 0.9rem;
        }
    }
    </style>
