// utils.js


// utils.js

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
    console.log("Styling good pick:", pick);
    pick.find('g').attr('fill', 'url(#green)');
    pick.find('g circle').attr('stroke', '#16871a');
}

function styleBadPick(pick) {
    console.log("Styling bad pick:", pick);
    pick.find('g').attr('fill', 'url(#red)');
    pick.find('g circle').attr('stroke', '#af1620');
}


function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";
}

function getCookie(name) {
    const cname = name + "=";
    const decoded = decodeURIComponent(document.cookie);
    const ca = decoded.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(cname) === 0) {
            return c.substring(cname.length, c.length);
        }
    }
    return "";
}

function deleteCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

// presence.js