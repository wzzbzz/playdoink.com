var urlParams = new URLSearchParams(window.location.search);
var challengeId = urlParams.get('challenge');

console.log("Challenge ID:", challengeId);

var winner;
var streak;
var bestScore;

var doink = new Audio('resources/doink.mp3');
doink.addEventListener('ended', () => newTurn());
var sproing = new Audio('resources/sproing2.mp3');
var highscore = new Audio('resources/highscore.mp3');

$(document).ready(function () {
    $("#playagain").click(() => startGame());
    bestScore = (typeof $.cookie('doinkhighscore') === "undefined") ? 0 : $.cookie('doinkhighscore');

    // Intro play button
    $("#play-now").click(function (e) {
        e.preventDefault();
        $("#intro-overlay").fadeOut(500, function () {
            $("#wrap").fadeIn(300);
            startGame();
        });
    });

    //startGame();
});

function track(eventType, metadata = {}) {
    fetch('https://app.playdoink.com/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType, metadata }),
        credentials: 'include'   // 👈 ensures cookies (like your tracking_session) get sent
    })
        .then(response => response.json())
        .then(data => console.log('Tracked:', data))
        .catch(err => console.error('Error tracking event:', err));
}

function startGame() {

    track('game_start');

    enableButtons();
    $('.svgbutton g').attr('fill', 'url(#grey');
    $('.svgbutton g circle').attr('stroke', '#bbb');
    $("#end").hide();
    streak = 0;
    coinToss();
}

function enableButtons() {
    $(".svgbutton").click(function () {
        checkPick($(this));
    });
}

function disableButtons() {
    $(".svgbutton").unbind("click");
}

function endGame() {
    console.log("Game Over");
    track('game_end', { "streak": streak });
    setTimeout(() => {
        disableButtons();
        showEndScreen();
    }, 250);
}

function coinToss() {
    let num = Math.random();
    if (num < .4) { winner = "1"; }
    else if (num < .8) { winner = "2"; }
    else { winner = true; }
}

function checkPick(pick) {
    if (winner === true || pick.attr('id') == winner) {
        goodPick(pick);
    } else {
        badPick(pick);
    }
}

function newTurn() {
    enableButtons();
    coinToss();
    $('.svgbutton g').attr('fill', 'url(#grey');
    $('.svgbutton g circle').attr('stroke', '#bbb');
}

function goodPick(pick) {
    disableButtons();
    streak++;
    pick.find('g').attr('fill', 'url(#green');
    pick.find('g circle').attr('stroke', '#16871a');
    $("#current-streak-value").text(streak);
    if (streak > bestScore) {
        bestScore = streak;
        $.cookie('doinkhighscore', bestScore);
        $("#best-score-value").text(bestScore);
    }
    doink.play();
}

function badPick(pick) {
    disableButtons();
    pick.find('g').attr('fill', 'url(#red');
    pick.find('g circle').attr('stroke', '#af1620');
    if (streak > bestScore) {
        bestScore = streak;
        $.cookie('doinkhighscore', bestScore);
    }
    sproing.play();
    endGame();
}

function makeScoreImage(score, best) {
    const canvas = document.getElementById("scoreCanvas");
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#000";
    ctx.font = "50px 'Luckiest Guy', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("can you beat my", canvas.width / 2, 80);

    ctx.fillStyle = "#4CAF50";
    ctx.font = "140px 'Luckiest Guy', Arial, sans-serif";
    ctx.fillText(best, canvas.width / 2, 200);

    ctx.font = "50px 'Luckiest Guy', Arial, sans-serif";
    const center = canvas.width / 2;
    const y = 280;

    const beginning = "on ";
    const middle = "DO!NK";
    const end = "?";

    beginningMetrics = ctx.measureText(beginning);
    middleMetrics = ctx.measureText(middle);
    endMetrics = ctx.measureText(end);

    const boxpadding = 10;
    const middleWidth = middleMetrics.width + boxpadding * 2;
    const totalWidth = beginningMetrics.width + middleWidth + endMetrics.width;

    let xstart = (center - totalWidth / 2);

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#000";
    ctx.fillText(beginning, xstart, y);

    xstart += beginningMetrics.width + 10;

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

    ctx.fillStyle = "#2b8bf6";
    ctx.fillText(middle, xstart, y);

    xstart = xstart + boxWidth;
    ctx.fillStyle = "#000";
    ctx.fillText(end, xstart, y);

    return canvas.toDataURL("image/png");
}

function showEndScreen() {
    $("#yourscore").text(streak);
    $("#bestrun").text(bestScore);
    $("#end").show();

    const imgData = makeScoreImage(streak, bestScore);

    $.post("save_score_image.php", { image: imgData, score: bestScore })
        .done(function (response) {
            const data = response;
            const sharePage = `https://playdoink.com/share.php?score=${bestScore}`;
            renderShareButtons(sharePage);
        })
        .fail(function (err) {
            console.error("Error saving image:", err);
        });
}

function renderShareButtons(url) {
    const container = document.getElementById("share-buttons-container");
    const shareData = {
        title: "DO!NK Score",
        url: url
    };

    // simple mobile detection
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile && navigator.share) {
        container.innerHTML = `<button id="native-share" class="share-btn">Share</button>`;
        document.getElementById("native-share").addEventListener("click", async () => {
            track('share_attempt');
            try { await navigator.share(shareData); }
            catch (err) { console.log("Share cancelled or failed:", err); }
        });
    } else {
        // always desktop fallback
        container.innerHTML = `
          <div id="share-buttons">
            <button class="share-btn twitter">Twitter</button>
            <button class="share-btn facebook">Facebook</button>
            <button class="share-btn whatsapp">WhatsApp</button>
            <button class="share-btn reddit">Reddit</button>
            <button id="copy-link">Copy Link</button>
          </div>`;

        document.querySelector(".twitter").onclick = () =>
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`);
        document.querySelector(".facebook").onclick = () =>
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`);
        document.querySelector(".whatsapp").onclick = () =>
            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareData.text + " " + shareData.url)}`);
        document.querySelector(".reddit").onclick = () =>
            window.open(`https://www.reddit.com/submit?url=${encodeURIComponent(shareData.url)}&title=${encodeURIComponent(shareData.title)}`);
        document.getElementById("copy-link").onclick = () => {
            navigator.clipboard.writeText(shareData.url);
            alert("Link copied to clipboard!");
        };
    }
}

    </script >