const classicGame = {
  name: "Classic DO!NK",
  state: { streak: 0, bestScore: 0, winner: null },

  // Initialize the game state and UI
  async init() {
    
    this.state.streak = 0;
    
    // Load best score from server if logged in, otherwise from cookie
    await this.loadBestScore();

    // Set up sound callback to start new turn when doink sound ends
    sounds.doink.onended = () => {
      this.newTurn();
    };

    this.newTurn();
    this.renderUI();
    $("#endgame_modal").hide();

  },

  // Load best score from server or cookie
  async loadBestScore() {
    const userData = localStorage.getItem('doink_user');
    
    if (userData) {
      // User is logged in - get best score from server
      try {
        const user = JSON.parse(userData);
        const response = await fetch(`${CONFIG.API_URL}/api/leaderboard/my-stats/${user.id}`);
        const data = await response.json();
        
        if (response.ok && data.bestScore) {
          this.state.bestScore = data.bestScore;
          // Update cookie to match server
          $.cookie('doinkhighscore', this.state.bestScore, { expires: 365 });
        } else {
          // Fallback to cookie
          this.state.bestScore = $.cookie('doinkhighscore') || 0;
          // temporarily disable cookie 
          this.state.bestScore = 0;
        }
      } catch (error) {
        console.error('Failed to load best score from server:', error);
        // Fallback to cookie
        this.state.bestScore = $.cookie('doinkhighscore') || 0;
      }
    } else {
      // Not logged in - use cookie
      this.state.bestScore = $.cookie('doinkhighscore') || 0;
    }
  },

  // Start a new turn by enabling buttons and randomly selecting winner
  newTurn() {
    enableButtons((button) => {
      this.action(button);
    });

    // Randomly determine winner: 40% button 1, 40% button 2, 20% either button wins
    let num = Math.random();
    if (num < .4) this.state.winner = "1";
    else if (num < .8) this.state.winner = "2";
    else this.state.winner = true; // Either button is correct

    resetButtons(); // ✅ now uses helper
  },

  // Handle player button selection
  // pick is the button.  
  action(button_selected) {

    disableButtons();


    if (currentRoom) {
      // Broadcast the pick to the server
      fetch('https://app.playdoink.com/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          room: urlParams.get('room'),
          buttonId: button_selected.attr('id'),
          playerName: you,
          result: this.state.winner === true || button_selected.attr('id') == this.state.winner
        })
      })
        .then(response => response.json())
        .then(data => {
          console.log('Server response:', data);
        })
        .catch(error => {
          console.error('Error:', error);
        });

    }


    // Check if player picked correctly
    this.handlePick(button_selected);
  },

  handlePick(button_selected) {
    const correct = (this.state.winner === true || button_selected.attr('id') == this.state.winner);
    
    // Save selection to database
    this.saveSelection(button_selected.attr('id'), correct);
    
    if (correct) {
      this.handleCorrect(button_selected);
    } else {
      this.handleIncorrect(button_selected);
    }
  },

  // Save selection to backend
  async saveSelection(buttonId, success) {
    const userData = localStorage.getItem('doink_user');
    if (!userData) return; // Not logged in
    
    const user = JSON.parse(userData);
    if (!user.id) return; // No user ID
    
    const selection = buttonId === '1' ? 'bottom' : 'top';
    
    try {
      await fetch(`${CONFIG.API_URL}/api/auth/save-selection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          selection: selection,
          success: success
        })
      });
    } catch (error) {
      console.error('Failed to save selection:', error);
      // Don't block gameplay on save failures
    }
  },

  // Handle correct button selection
  handleCorrect(pick) {
    this.state.streak++;

    // Update best score if current streak exceeds it
    if (this.state.streak > this.state.bestScore) {
      this.state.bestScore = this.state.streak;
      $.cookie('doinkhighscore', this.state.bestScore, { expires: 365 }); // Save for 1 year
    }

    // Update UI with new scores
    $("#current-streak-value").text(this.state.streak);
    $("#best-score-value").text(this.state.bestScore);
    const correct = (this.state.winner === true || pick.attr('id') == this.state.winner);

    styleGoodPick(pick); // ✅ green
    sounds.doink.play();
  },

  // Handle incorrect button selection
  handleIncorrect(pick) {
    styleBadPick(pick); // ✅ red
    sounds.sproing.play();

    // Small delay before ending game
    setTimeout(() => {
      this.endGame();
    }, 250);
  },

  // End the current game and show results
  endGame() {
    // Play special sound if new high score achieved
    // Submit score to leaderboard
    this.submitScore(this.state.streak);
    this.showEndScreen(this.state.streak, this.state.bestScore);
  },

  // Submit score to backend
  async submitScore(scoreValue) {
    // Don't submit zero scores
    if (scoreValue === 0) return;
    
    const userData = localStorage.getItem('doink_user');
    if (!userData) return; // Not logged in
    
    const user = JSON.parse(userData);
    if (!user.id) return; // No user ID
    
    try {
      await fetch(`${CONFIG.API_URL}/api/leaderboard/submit-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          score: scoreValue
        })
      });
      console.log('Score submitted:', scoreValue);
    } catch (error) {
      console.error('Failed to submit score:', error);
      // Don't block gameplay on submission failures
    }
  },

  // Update the UI with current game state
  renderUI() {
    $("#current-streak-value").text(this.state.streak);
    $("#best-score-value").text(this.state.bestScore);
  },

  // Generate a shareable score image on canvas
  makeScoreImage(score, best) {
    const canvas = document.getElementById("scoreCanvas");
    const ctx = canvas.getContext("2d");

    // White background
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header text
    ctx.fillStyle = "#000";
    ctx.font = "50px 'Luckiest Guy', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("can you beat my", canvas.width / 2, 80);

    // Large score number in green
    ctx.fillStyle = "#4CAF50";
    ctx.font = "140px 'Luckiest Guy', Arial, sans-serif";
    ctx.fillText(best, canvas.width / 2, 200);

    // Bottom text with styled "DO!NK" in a box
    ctx.font = "50px 'Luckiest Guy', Arial, sans-serif";
    const center = canvas.width / 2;
    const y = 280;

    const beginning = "on ";
    const middle = "DO!NK";
    const end = "?";

    // Measure text widths for proper positioning
    const beginningMetrics = ctx.measureText(beginning);
    const middleMetrics = ctx.measureText(middle);
    const endMetrics = ctx.measureText(end);

    const boxpadding = 10;
    const middleWidth = middleMetrics.width + boxpadding * 2;
    const totalWidth = beginningMetrics.width + middleWidth + endMetrics.width;

    let xstart = (center - totalWidth / 2);

    // Draw "on " in black
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#000";
    ctx.fillText(beginning, xstart, y);

    xstart += beginningMetrics.width + 10;

    // Draw blue box around "DO!NK"
    const paddingX = 10;
    const paddingY = 10;
    const boxWidth = middleMetrics.width + paddingX * 2;
    const boxHeight =
      middleMetrics.actualBoundingBoxAscent +
      middleMetrics.actualBoundingBoxDescent +
      paddingY * 2;

    const boxX = xstart - paddingX;
    const boxY = y - middleMetrics.actualBoundingBoxAscent - paddingY;

    ctx.strokeStyle = "#2b8bf6";
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

    // Draw "DO!NK" in blue
    ctx.fillStyle = "#2b8bf6";
    ctx.fillText(middle, xstart, y);

    // Draw "?" in black
    xstart = xstart + boxWidth;
    ctx.fillStyle = "#000";
    ctx.fillText(end, xstart, y);

    return canvas.toDataURL("image/png");
  },

  // Display end game screen with scores and sharing options
  showEndScreen(streak, bestScore) {

    $("#yourscore").text(streak);
    $("#bestrun").text(bestScore);
    $("#endgame_modal").show();
    
    // Show "NEW HIGH SCORE!" notification if this is a new personal best
    if (streak > 0 && streak === bestScore) {
      const notification = $('<div class="high-score-notification">🎉 NEW HIGH SCORE! 🎉</div>');
      $('#results').append(notification);
      sounds.highscore.play();
      // Animate in
      setTimeout(() => notification.addClass('show'), 10);
      
      // Remove after 3 seconds
      setTimeout(() => {
        notification.removeClass('show');
        setTimeout(() => notification.remove(), 500);
      }, 1500);
    }
    
    $("#results").show();

    // Generate and save score image for sharing
    const imgData = this.makeScoreImage(streak, bestScore);

    $.post("save_score_image.php", { image: imgData, score: bestScore })
      .done(function (response) {
        const sharePage = `https://playdoink.com/share.php?score=${bestScore}`;
        renderShareButtons(sharePage);
      })
      .fail(function (err) {
        console.error("Error saving image:", err);
      });
  }
};

// Register this game type
gameTypes.classic = classicGame;
