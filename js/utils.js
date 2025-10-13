// utils.js


// utils.js

// --- Audio setup ---
const sounds = {
    doink: new Audio('resources/doink.mp3'),
    sproing: new Audio('resources/sproing2.mp3'),
    highscore: new Audio('resources/highscore.mp3'),
    ding: new Audio('resources/ding.mp3'),
    highfive: new Audio('resources/highfive.mp3')
};

// Optional: when "doink" ends, trigger a new turn (for classic)
sounds.doink.addEventListener('ended', () => {
    if (currentGame && typeof currentGame.newTurn === "function") {
        currentGame.newTurn();
    }
});



function track(eventType, metadata = {}) {
    fetch('https://app.playdoink.com/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType, metadata }),
        credentials: 'include'
    })
        .then(response => response.json())
        .then(data => console.log('Tracked:', data))
        .catch(err => console.error('Error tracking event:', err));
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

    const beginningMetrics = ctx.measureText(beginning);
    const middleMetrics = ctx.measureText(middle);
    const endMetrics = ctx.measureText(end);

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

function showEndScreen(streak, bestScore) {
    $("#yourscore").text(streak);
    $("#bestrun").text(bestScore);
    $("#end").show();

    const imgData = makeScoreImage(streak, bestScore);

    $.post("save_score_image.php", { image: imgData, score: bestScore })
        .done(function (response) {
            const sharePage = `https://playdoink.com/share.php?score=${bestScore}`;
            renderShareButtons(sharePage);
        })
        .fail(function (err) {
            console.error("Error saving image:", err);
        });
}

function renderShareButtons(url) {
    const container = document.getElementById("share-buttons-container");
    const shareData = { title: "DO!NK Score", url: url };

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    console.log("isMobile=" + isMobile);
    console.log("navigator.share=" + navigator.share);
    if (isMobile && navigator.share) {
        container.innerHTML = `<button id="native-share" class="share-btn">Share</button>`;
        document.getElementById("native-share").addEventListener("click", async () => {
            track('share_attempt');
            try { await navigator.share(shareData); }
            catch (err) { console.log("Share cancelled or failed:", err); }
        });
    } else {
        container.innerHTML = `
          <div id="share-buttons">
            <button class="share-btn twitter">Twitter</button>
            <button class="share-btn facebook">Facebook</button>
            <button class="share-btn whatsapp">WhatsApp</button>
            <button class="share-btn reddit">Reddit</button>
            <button id="copy-link">Copy Link</button>
          </div>`;

        document.querySelector(".twitter").onclick = () =>
            window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareData.url)}`);
        document.querySelector(".facebook").onclick = () =>
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`);
        document.querySelector(".whatsapp").onclick = () =>
            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareData.url)}`);
        document.querySelector(".reddit").onclick = () =>
            window.open(`https://www.reddit.com/submit?url=${encodeURIComponent(shareData.url)}&title=${encodeURIComponent(shareData.title)}`);
        document.getElementById("copy-link").onclick = () => {
            navigator.clipboard.writeText(shareData.url);
            alert("Link copied to clipboard!");
        };
    }


}

function disableButtons() {
    $('.svgbutton').off('click');
    $('.svgbutton').css('cursor', 'default');
}

function enableButtons(handler) {
    $('.svgbutton').off('click').on('click', function () {
        handler($(this));
    });
    $('.svgbutton').css('cursor', 'pointer');
}   

// --- Button Styling Helpers ---
function resetButtons() {
    $('.svgbutton g').attr('fill', 'url(#grey)');
    $('.svgbutton g circle').attr('stroke', '#bbb');
}

function styleGoodPick(pick) {
    pick.find('g').attr('fill', 'url(#green)');
    pick.find('g circle').attr('stroke', '#16871a');
}

function styleBadPick(pick) {
    pick.find('g').attr('fill', 'url(#red)');
    pick.find('g circle').attr('stroke', '#af1620');
}
