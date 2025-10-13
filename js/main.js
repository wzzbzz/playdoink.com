// main.js
$(document).ready(function () {
  const urlParams = new URLSearchParams(window.location.search);
  let challengeId = urlParams.get('challenge');

  // Decide mode
  let mode = "classic";
  if (challengeId) {
    mode = "battle";
  } else if (urlParams.get('mode') === "challenge") {
    mode = "challenge";
  }

  console.log("Mode:", mode);
  // Play Now button
  $("#play-now").click(function (e) {
    e.preventDefault();
    $("#intro-overlay").fadeOut(500, function () {
      $("#wrap").fadeIn(300);
      loadGame(mode);   // instead of startGame()
    });
  });

  // Create Challenge button
  $("#create-challenge").on("click", function (e) {
    e.preventDefault();

    if (!myUserName) {
      const name = prompt("Enter your name:");
      if (name && name.trim().length > 0) {
        $.cookie("doink_username", name.trim(), { expires: 7 });
        location.reload();
      } else {
        alert("Name is required to create a challenge.");
        return;
      }
    }

    $.post("https://app.playdoink.com/challenge/create",
      { playerId: myPlayerId, userName: myUserName },
      function (res) {
        const link = window.location.origin + "/?challenge=" + res.challenge;
        $("#challenge-link").text(link).show();

        challengeId = res.challenge;

        navigator.clipboard.writeText(link).then(function () {
          alert("Challenge link created and copied to clipboard!");
        }, function () {
          alert("Challenge link created! Copy it from the text box.");
        });

        joinChallenge(res.challenge, myPlayerId);

        $("#intro-overlay").fadeOut(500, function () {
          $("#wrap").fadeIn(300);
          loadGame("challenge");
        });
      }
    );
  });

  // Fallback direct load (e.g. if you go straight into battle via URL)
  if (!$("#play-now").length && !$("#create-challenge").length) {
    loadGame(mode);
  }

  // Hook up coin buttons globally
  $(".svgbutton").click(function () {
    checkPick($(this));
  });

  $("#playagain").click(() => loadGame(mode));
});
