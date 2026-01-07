    <div id="leaderboard-overlay" class="overlay" style="display:none;">
        <div class="leaderboard-container">
            <button id="close-leaderboard" class="close-btn">×</button>
            
            <h2>Leaderboard</h2>
            
            <div class="leaderboard-tabs">
                <button id="tab-daily" class="tab-btn active">Today</button>
                <button id="tab-alltime" class="tab-btn">All Time</button>
            </div>
            
            <div id="leaderboard-content" class="leaderboard-content">
                <div class="loading">Loading...</div>
            </div>
        </div>
    </div>

    <style>
    #leaderboard-overlay {
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(5px);
        padding: 2rem;
        box-sizing: border-box;
    }

    .leaderboard-container {
        background: white;
        padding: 2rem;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        margin: 0 auto;
        position: relative;
        box-sizing: border-box;
    }

    .leaderboard-container h2 {
        font-family: 'Luckiest Guy', cursive;
        font-size: 2.5rem;
        margin: 0 0 1.5rem 0;
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

    .leaderboard-tabs {
        display: flex;
        gap: 1rem;
        margin-bottom: 1.5rem;
        border-bottom: 2px solid #eee;
    }

    .tab-btn {
        font-family: 'Luckiest Guy', cursive;
        font-size: 1.2rem;
        background: none;
        border: none;
        color: #999;
        padding: 0.75rem 1.5rem;
        cursor: pointer;
        transition: all 0.2s;
        border-bottom: 3px solid transparent;
        margin-bottom: -2px;
    }

    .tab-btn.active {
        color: #2b8bf6;
        border-bottom-color: #2b8bf6;
    }

    .tab-btn:hover {
        color: #2b8bf6;
    }

    .leaderboard-content {
        min-height: 300px;
    }

    .loading {
        text-align: center;
        font-family: Arial, sans-serif;
        color: #999;
        padding: 3rem;
    }

    .leaderboard-table {
        width: 100%;
        border-collapse: collapse;
    }

    .leaderboard-table th {
        font-family: 'Luckiest Guy', cursive;
        font-size: 1rem;
        color: #666;
        text-align: left;
        padding: 1rem 0.5rem;
        border-bottom: 2px solid #eee;
    }

    .leaderboard-table th:first-child {
        width: 60px;
        text-align: center;
    }

    .leaderboard-table th:last-child {
        width: 80px;
        text-align: right;
    }

    .leaderboard-table td {
        font-family: Arial, sans-serif;
        padding: 1rem 0.5rem;
        border-bottom: 1px solid #f5f5f5;
    }

    .leaderboard-table tr:hover {
        background: #f9f9f9;
    }

    .rank {
        text-align: center;
        font-weight: bold;
        color: #2b8bf6;
    }

    .rank.top3 {
        font-size: 1.5rem;
    }

    .rank-1 { color: #FFD700; } /* Gold */
    .rank-2 { color: #C0C0C0; } /* Silver */
    .rank-3 { color: #CD7F32; } /* Bronze */

    .player-name {
        font-weight: 500;
        color: #333;
    }

    .player-score {
        text-align: right;
        font-weight: bold;
        font-size: 1.2rem;
        color: #62bf5e;
    }

    .empty-state {
        text-align: center;
        padding: 3rem;
        font-family: Arial, sans-serif;
        color: #999;
    }

    .empty-state-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
    }
    </style>
