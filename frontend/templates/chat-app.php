<div id="chat-app" class="overlay" style="display:none;">
        <div class="chat-room">
            <!-- <canvas id="chat-room-canvas" width="800" height="400" style="border:1px solid #000;"></canvas> -->

            <!-- Messages -->
            <div id="chat-messages" style="height: 200px; overflow-y: auto; border: 1px solid #ccc; margin-top: 10px; padding: 10px;"></div>

            <!-- Input -->
            <form id="chat-form" style="margin-top: 10px;">
                <input type="text" id="chat-input" placeholder="Type your message..." style="width: 80%;" required />
                <button type="submit" style="width: 18%;">Send</button>
            </form>
            <button id="doink-btn" style="width: 18%;">Doink</button>
            
            <!-- User list -->
            <h3>Users in room:</h3>
            <ul id="chat-users"></ul>
        </div>
    </div>