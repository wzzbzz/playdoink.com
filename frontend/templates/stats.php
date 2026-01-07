    <div id="stats-overlay" class="overlay" style="display:none;">
        <div class="stats-container">
            <button id="close-stats" class="close-btn">×</button>
            
            <h2>My Stats</h2>
            
            <div id="stats-content" class="stats-content">
                <div class="loading">Loading...</div>
            </div>
        </div>
    </div>

    <style>
    #stats-overlay {
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(5px);
        padding: 2rem;
        box-sizing: border-box;
    }

    .stats-container {
        background: white;
        padding: 2rem;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        max-width: 500px;
        margin: 0 auto;
        position: relative;
        box-sizing: border-box;
    }

    .stats-container h2 {
        font-family: 'Luckiest Guy', cursive;
        font-size: 2.5rem;
        margin: 0 0 2rem 0;
        color: #2b8bf6;
        text-align: center;
    }

    .stats-content {
        min-height: 200px;
    }

    .stat-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1.5rem;
        border-radius: 12px;
        margin-bottom: 1rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .stat-label {
        font-family: Arial, sans-serif;
        font-size: 0.9rem;
        opacity: 0.9;
        margin-bottom: 0.5rem;
    }

    .stat-value {
        font-family: 'Luckiest Guy', cursive;
        font-size: 3rem;
        margin: 0;
    }

    .stat-subtext {
        font-family: Arial, sans-serif;
        font-size: 0.85rem;
        opacity: 0.8;
        margin-top: 0.5rem;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-top: 1rem;
    }

    .mini-stat-card {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 8px;
        text-align: center;
    }

    .mini-stat-label {
        font-family: Arial, sans-serif;
        font-size: 0.85rem;
        color: #666;
        margin-bottom: 0.5rem;
    }

    .mini-stat-value {
        font-family: 'Luckiest Guy', cursive;
        font-size: 1.8rem;
        color: #2b8bf6;
    }

    .no-stats {
        text-align: center;
        padding: 3rem;
        color: #999;
        font-family: Arial, sans-serif;
    }

    .no-stats-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
    }
    </style>
