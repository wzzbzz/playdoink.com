    <!-- Settings: nickname (logged in) and the timezone for "today" on the leaderboards. Wired by initSettingsForm() in js/utils.js. -->
    <div id="settings-overlay" class="overlay" style="display:none;">
        <div class="settings-container">
            <button id="close-settings" class="close-btn">×</button>

            <h2>Settings</h2>

            <div class="settings-form">
                <label class="settings-label" for="settings-nick">Nickname</label>
                <div class="settings-row" data-nick-row>
                    <input type="text" id="settings-nick" data-nick maxlength="20" autocomplete="off" placeholder="Enter nickname">
                    <button type="button" data-nick-save class="settings-save">Save</button>
                </div>
                <p class="settings-note" data-nick-loggedout hidden><a href="#" id="settings-login">Log in</a> to set a nickname.</p>
                <div class="settings-msg" data-nick-msg hidden></div>

                <label class="settings-label" for="settings-tz">Timezone for &ldquo;Today&rdquo;</label>
                <select id="settings-tz" data-tz></select>
                <p class="settings-note">The daily leaderboard resets at midnight in this timezone.</p>
                <div class="settings-msg" data-tz-msg hidden></div>
            </div>
        </div>
    </div>

    <style>
    #settings-overlay {
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(5px);
        padding: 2rem;
        box-sizing: border-box;
    }
    .settings-container {
        background: white;
        padding: 2rem;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        max-width: 500px;
        margin: 0 auto;
        position: relative;
        box-sizing: border-box;
    }
    .settings-container h2 {
        font-family: 'Luckiest Guy', cursive;
        font-size: 2.5rem;
        margin: 0 0 1.5rem 0;
        color: #2b8bf6;
        text-align: center;
    }
    .settings-form { font-family: Arial, sans-serif; text-align: left; }
    .settings-label { display: block; font-weight: bold; color: #444; margin: 1rem 0 .4rem; }
    .settings-row { display: flex; gap: .5rem; }
    .settings-row[hidden] { display: none; }
    .settings-form input, .settings-form select {
        flex: 1; min-width: 0; width: 100%; box-sizing: border-box; font: 1rem Arial, sans-serif;
        padding: .7rem; border: 3px solid #2b8bf6; border-radius: 8px; outline: none; background: #fff;
    }
    .settings-form input:focus, .settings-form select:focus { border-color: #62bf5e; }
    .settings-save {
        font-family: 'Luckiest Guy', cursive; font-size: 1.2rem; padding: .6rem 1rem; border: none;
        border-radius: 8px; background: #62bf5e; color: #fff; cursor: pointer;
    }
    .settings-note { font-size: .85rem; color: #777; margin: .4rem 0 0; }
    .settings-note a { color: #2b8bf6; }
    .settings-msg { font-size: .85rem; margin-top: .4rem; }
    .settings-msg.ok { color: #155724; }
    .settings-msg.err { color: #721c24; }
    </style>
