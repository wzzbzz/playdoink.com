    <div id="nickname-overlay" class="overlay" style="display:none;">
        <div class="nickname-card">
            <h2>Choose Your Nickname</h2>
            <p class="nickname-subtitle">This will be displayed on leaderboards</p>
            
            <form id="nickname-form">
                <input 
                    type="text" 
                    id="nickname-input" 
                    placeholder="Enter nickname" 
                    maxlength="20"
                    required
                    autocomplete="off"
                />
                <button type="submit" id="nickname-submit-btn" class="btn">
                    Save Nickname
                </button>
            </form>
            
            <p class="nickname-footer">You can change this later in settings</p>
        </div>
    </div>

    <style>
    #nickname-overlay {
        background: url('/resources/doink-splash.jpeg') no-repeat center center/cover;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    @media (min-width: 901px) {
        #nickname-overlay {
            background-position: center calc(0% - 300px);
        }
    }

    @media (min-width: 601px) {
        #nickname-overlay {
            background-position: center calc(0% - 200px);
        }
    }

    .nickname-card {
        background: rgba(255, 255, 255, 0.95);
        padding: 2rem;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        max-width: 400px;
        width: 90%;
        text-align: center;
    }

    .nickname-card h2 {
        font-family: 'Luckiest Guy', cursive;
        font-size: 2.5rem;
        margin: 0 0 0.5rem 0;
        color: #2b8bf6;
    }

    .nickname-subtitle {
        font-family: Arial, sans-serif;
        font-size: 1rem;
        color: #666;
        margin: 0 0 2rem 0;
    }

    #nickname-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    #nickname-input {
        font-family: Arial, sans-serif;
        padding: 1rem;
        font-size: 1rem;
        border: 3px solid #2b8bf6;
        border-radius: 8px;
        outline: none;
        text-align: center;
    }

    #nickname-input:focus {
        border-color: #62bf5e;
    }

    #nickname-submit-btn {
        font-family: 'Luckiest Guy', cursive;
        padding: 1rem;
        font-size: 1.5rem;
        background-color: #62bf5e;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    #nickname-submit-btn:hover {
        background-color: #4fa047;
    }

    .nickname-footer {
        font-family: Arial, sans-serif;
        font-size: 0.85rem;
        color: #999;
        margin-top: 1.5rem;
    }
    </style>
