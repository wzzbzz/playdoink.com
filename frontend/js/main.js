// main.js
$(document).ready(function () {

  loadCurrentUser();

  // Handle browser back button
  let isInGame = false;

  window.addEventListener('popstate', function(event) {
    if (isInGame) {
      // User pressed back while in game - return to intro
      $("#game-console").fadeOut(300);
      $("#intro-overlay").fadeIn(500);
      isInGame = false;
    }
  });

  // Push state when entering game
  function enterGame() {
    history.pushState({ inGame: true }, '', window.location.href);
    isInGame = true;
  }

  // Push state when returning to intro
  function returnToIntro() {
    isInGame = false;
    // Go back if we pushed a state
    if (history.state && history.state.inGame) {
      history.back();
    }
  }

  // Check if we should show nickname prompt
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('show-nickname') === '1') {
    const userData = JSON.parse(localStorage.getItem('doink_user'));
    if (userData && userData.email && !userData.username) {
      $("#nickname-overlay").fadeIn(300);
    }
  }

  // Play Now button
  $("#play-now").click(function (e) {
    e.preventDefault();
    $("#intro-overlay").fadeOut(500, function () {
      $("#game-console").fadeIn(300);
      loadGame('classic');   // instead of startGame()
      enterGame(); // Push history state
    });
  });

  $("#login-register").click(function (e) {
    e.preventDefault();
    $("#intro-container").fadeOut(500, function () {
      $("#auth-container").fadeIn(300);
    });
  });

  // Back to intro from auth
  $("#back-to-intro").click(function (e) {
    e.preventDefault();
    $("#auth-container").fadeOut(300, function () {
      $("#intro-container").fadeIn(500);
    });
  });

  // Magic link form submission
  $("#auth-form").submit(async function (e) {
    e.preventDefault();

    const email = $("#email-input").val();
    const submitBtn = $("#auth-submit-btn");
    const messageEl = $("#auth-message");

    // Disable button during request
    submitBtn.prop('disabled', true);
    submitBtn.text('Sending...');
    messageEl.removeClass('success error').hide();

    try {
      const response = await fetch(`${CONFIG.API_URL}/api/auth/request-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        messageEl.addClass('success').text('✓ Check your email! We sent you a magic link.').show();
        $("#email-input").val('');
      } else {
        throw new Error(data.message || 'Failed to send magic link');
      }
    } catch (error) {
      messageEl.addClass('error').text('✗ ' + error.message).show();
    } finally {
      submitBtn.prop('disabled', false);
      submitBtn.text('Send Magic Link');
    }
  });

  $("#playagain").click(() => loadGame('classic'));

  // Menu button handlers
  $("#menu-btn").click(function () {
    $("#game-menu-overlay").fadeIn(300);
  });

  $("#close-menu").click(function () {
    $("#game-menu-overlay").fadeOut(300);
  });

  $("#back-to-home").click(function () {
    $("#game-menu-overlay").fadeOut(300);
    $("#game-console").fadeOut(300);
    $("#intro-overlay").fadeIn(500);
    returnToIntro(); // Handle history state
  });

  $("#view-leaderboard").click(function () {
    $("#game-menu-overlay").fadeOut(300);
    $("#leaderboard-overlay").fadeIn(300);
    loadLeaderboard('daily'); // Load daily by default
  });

  $("#view-stats").click(function () {
    $("#game-menu-overlay").fadeOut(300);
    $("#stats-overlay").fadeIn(300);
    loadPersonalStats();
  });

  $("#view-faq").click(function () {
    $("#game-menu-overlay").fadeOut(300);
    $("#faq-overlay").fadeIn(300);
  });

  $("#close-stats").click(function () {
    $("#stats-overlay").fadeOut(300);
  });

  $("#close-leaderboard").click(function () {
    $("#leaderboard-overlay").fadeOut(300);
  });

  $("#close-faq").click(function () {
    $("#faq-overlay").fadeOut(300);
  });

  $("#tab-daily").click(function () {
    $(".tab-btn").removeClass('active');
    $(this).addClass('active');
    loadLeaderboard('daily');
  });

  $("#tab-alltime").click(function () {
    $(".tab-btn").removeClass('active');
    $(this).addClass('active');
    loadLeaderboard('all-time');
  });

  // Nickname form submission
  $("#nickname-form").submit(async function (e) {
    e.preventDefault();

    const nickname = $("#nickname-input").val().trim();

    if (!nickname) {
      alert('Please enter a nickname');
      return;
    }

    // Get current user data
    const userData = JSON.parse(localStorage.getItem('doink_user'));

    if (!userData || !userData.id) {
      alert('Error: User not found');
      return;
    }

    try {
      // Save nickname to backend
      const response = await fetch(`${CONFIG.API_URL}/api/auth/update-username`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userData.id,
          username: nickname
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Update localStorage with new user data
        userData.username = nickname;
        localStorage.setItem('doink_user', JSON.stringify(userData));

        // Hide nickname overlay and show intro
        $("#nickname-overlay").fadeOut(300, function () {
          // Update the logged-in display
          loadCurrentUser();
        });
      } else {
        alert(data.message || 'Failed to save nickname');
      }
    } catch (error) {
      console.error('Failed to save nickname:', error);
      alert('Failed to save nickname. Please try again.');
    }
  });

});

function loadCurrentUser() {
  const userData = localStorage.getItem('doink_user');
  if (userData) {
    const user = JSON.parse(userData);

    // Check if session has expired
    if (user.sessionExpires) {
      const expirationDate = new Date(user.sessionExpires);
      const now = new Date();

      if (now > expirationDate) {
        // Session expired - clear it
        localStorage.removeItem('doink_user');
        location.reload();
        return;
      }
    }

    // If user has an email (logged in), update the UI
    if (user.email) {
      // Hide login button and show logged-in state
      $("#login-register").hide();

      // Add logged-in indicator to intro screen
      if ($(".login-status").length === 0) {
        const displayName = user.username || user.email;
        $("#intro-container").prepend(`
          <div class="login-status">
            <p style="font-family: Arial; font-size: 0.9rem; color: #fff; margin-top: 1rem;">
              ✓ Logged in as <strong>${displayName}</strong>
            </p>
            <button id="logout-btn" style="font-family: Arial; background: rgba(255,255,255,0.2); border: none; color: white; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; margin-top: 0.5rem;">
              Logout
            </button>
          </div>
        `);

        // Logout handler
        $("#logout-btn").click(function () {
          localStorage.removeItem('doink_user');
          location.reload();
        });
      }
    }
  } else {
    // Create default user data
    const defaultUser = {
      name: '',
    };
    localStorage.setItem('doink_user', JSON.stringify(defaultUser));
  }
}

async function loadLeaderboard(type) {
  const content = $("#leaderboard-content");
  content.html('<div class="loading">Loading...</div>');

  try {
    const endpoint = type === 'daily'
      ? `${CONFIG.API_URL}/api/leaderboard/daily`
      : `${CONFIG.API_URL}/api/leaderboard/all-time`;

    const response = await fetch(endpoint);
    const data = await response.json();

    if (data.leaderboard && data.leaderboard.length > 0) {
      let html = `
        <table class="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Score</th>
      `;

      // Add date column only for all-time leaderboard
      if (type === 'all-time') {
        html += '<th>Date</th>';
      }

      html += `
            </tr>
          </thead>
          <tbody>
      `;

      data.leaderboard.forEach((entry, index) => {
        const rank = index + 1;
        const rankClass = rank <= 3 ? `rank-${rank} top3` : '';
        const displayName = entry.username || entry.email.split('@')[0];

        html += `
          <tr>
            <td class="rank ${rankClass}">${rank}</td>
            <td class="player-name">${displayName}</td>
            <td class="player-score">${entry.score}</td>
        `;

        // Add date only for all-time leaderboard
        if (type === 'all-time' && entry.createdAt) {
          const date = new Date(entry.createdAt.date || entry.createdAt);
          const formattedDate = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });
          html += `<td class="score-date">${formattedDate}</td>`;
        }

        html += '</tr>';
      });

      html += '</tbody></table>';
      content.html(html);
    } else {
      content.html(`
        <div class="empty-state">
          <div class="empty-state-icon">🏆</div>
          <p>No scores yet ${type === 'daily' ? 'today' : ''}!</p>
          <p>Be the first to set a score!</p>
        </div>
      `);
    }
  } catch (error) {
    console.error('Failed to load leaderboard:', error);
    content.html(`
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <p>Failed to load leaderboard</p>
      </div>
    `);
  }
}


async function loadPersonalStats() {
  const content = $("#stats-content");
  content.html('<div class="loading">Loading...</div>');

  let user = null;

  try {
    const raw = localStorage.getItem('doink_user');
    user = raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('Invalid doink_user in localStorage', e);
    user = null;
  }

  const valid_user =
    typeof user === 'object' &&
    user !== null &&
    typeof user.username === 'string' &&
    user.username.trim().length > 0;


  if (!valid_user) {
    content.html('<div class="no-stats"><div class="no-stats-icon">🔒</div><p>Please log in to view stats</p></div>');
    return;
  }

  if (!user.id) {
    content.html('<div class="no-stats"><div class="no-stats-icon">⚠️</div><p>User ID not found</p></div>');
    return;
  }

  try {
    const response = await fetch(`${CONFIG.API_URL}/api/leaderboard/my-stats/${user.id}`);
    const data = await response.json();

    if (response.ok) {
      const displayName = user.username || user.email.split('@')[0];

      let html = `
        <div style="text-align: center; margin-bottom: 2rem;">
          <h3 style="font-family: 'Luckiest Guy', cursive; font-size: 1.5rem; color: #666; margin: 0;">
            ${displayName}
          </h3>
        </div>
      `;

      if (data.bestScore !== null && data.bestScore > 0) {
        html += `
          <div class="stat-card">
            <div class="stat-label">Highest Streak</div>
            <div class="stat-value">${data.bestScore}</div>
            ${data.allTimeRank ? `<div class="stat-subtext">Rank #${data.allTimeRank} all-time</div>` : ''}
          </div>
        `;
      } else {
        html += `
          <div class="no-stats">
            <div class="no-stats-icon">🎮</div>
            <p>Play a game to see your stats!</p>
          </div>
        `;
      }

      if (data.totalSelections > 0) {
        html += `
          <div class="stats-grid">
            <div class="mini-stat-card">
              <div class="mini-stat-label">Success Rate Rank</div>
              <div class="mini-stat-value">#${data.successRateRank || 'N/A'}</div>
            </div>
            <div class="mini-stat-card">
              <div class="mini-stat-label">Total Picks</div>
              <div class="mini-stat-value">${data.totalSelections.toLocaleString()}</div>
            </div>
          </div>
        `;
      }

      content.html(html);
    } else {
      content.html('<div class="no-stats"><div class="no-stats-icon">⚠️</div><p>Failed to load stats</p></div>');
    }
  } catch (error) {
    console.error('Failed to load stats:', error);
    content.html('<div class="no-stats"><div class="no-stats-icon">⚠️</div><p>Failed to load stats</p></div>');
  }
}
