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

    // iPad Safari reports itself as a Mac, so also treat a touch-screen "Mac" as mobile.
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
        || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
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


// ---- Magic-link login, shared by pages that log in without Do!nk's intro screen (Megado!nk) ----
// `next` is the page to come back to after the link is clicked; the API and verify.php only
// accept a plain same-site path (see AuthController::safeReturnPath), anything else means "/".
async function requestMagicLink(email, next) {
    const body = { email };
    if (next) body.next = next;
    const response = await fetch(`${CONFIG.API_URL}/api/auth/request-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || 'Failed to send magic link');
    return data;
}


// ---- Settings: the player's timezone for "today" on the leaderboards, and their nickname ----
// A saved timezone comes from this browser (localStorage "doink_timezone", set on the Settings screen)
// or from the account (doink_user.timezone, returned at login). "" means automatic = this device's zone.
const DOINK_TZ_KEY = 'doink_timezone';

function getDeviceTimeZone() {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { return ''; }
}

function getSavedTimeZone() {
    try { const v = localStorage.getItem(DOINK_TZ_KEY); if (v) return v; } catch (e) {}
    try { const u = JSON.parse(localStorage.getItem('doink_user') || '{}'); if (u && u.timezone) return u.timezone; } catch (e) {}
    return '';
}

// The timezone for "today" (an IANA name such as "Europe/London"): the saved setting, else the device's.
function getUserTimeZone() {
    return getSavedTimeZone() || getDeviceTimeZone();
}

// Every IANA timezone the browser knows (falls back to a short list on old browsers).
function listTimeZones() {
    try { if (Intl.supportedValuesOf) return Intl.supportedValuesOf('timeZone'); } catch (e) {}
    return ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Anchorage',
            'Pacific/Honolulu', 'America/Toronto', 'America/Mexico_City', 'America/Sao_Paulo', 'Europe/London',
            'Europe/Paris', 'Europe/Berlin', 'Africa/Johannesburg', 'Asia/Kolkata', 'Asia/Shanghai', 'Asia/Tokyo',
            'Australia/Sydney', 'Pacific/Auckland', 'UTC'];
}

function doinkUser() {
    try { const u = JSON.parse(localStorage.getItem('doink_user') || '{}'); return u && u.id && u.apiToken ? u : null; }
    catch (e) { return null; }
}

// Save the timezone choice ("" = automatic): always in this browser, and on the account when logged in.
async function saveTimeZoneSetting(tz) {
    try { if (tz) localStorage.setItem(DOINK_TZ_KEY, tz); else localStorage.removeItem(DOINK_TZ_KEY); } catch (e) {}
    const user = doinkUser();
    if (!user) return { ok: true, message: 'Saved in this browser' };
    try {
        const r = await fetch(`${CONFIG.API_URL}/api/auth/update-settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + user.apiToken },
            body: JSON.stringify({ timezone: tz || null })
        });
        const data = await r.json().catch(() => ({}));
        if (!r.ok) return { ok: false, message: data.message || 'Couldn\'t save to your account' };
        user.timezone = tz || null;
        localStorage.setItem('doink_user', JSON.stringify(user));
        return { ok: true, message: 'Saved' };
    } catch (e) {
        return { ok: false, message: 'Saved in this browser; couldn\'t reach the server' };
    }
}

// Change the nickname (same endpoint and rules as the nickname prompt).
async function saveNicknameSetting(name) {
    const user = doinkUser();
    if (!user) return { ok: false, message: 'Please log in' };
    try {
        const r = await fetch(`${CONFIG.API_URL}/api/auth/update-username`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + user.apiToken },
            body: JSON.stringify({ username: name })
        });
        const data = await r.json().catch(() => ({}));
        if (!r.ok) return { ok: false, message: data.message || 'Failed to save nickname' };
        user.username = name;
        localStorage.setItem('doink_user', JSON.stringify(user));
        return { ok: true, message: 'Saved' };
    } catch (e) {
        return { ok: false, message: 'Failed to save nickname. Please try again.' };
    }
}

// Wire up a Settings form (Do!nk's overlay or Megado!nk's menu panel). Markup uses data- hooks:
// [data-nick-row] [data-nick] [data-nick-save] [data-nick-loggedout] [data-tz] [data-tz-msg] [data-nick-msg].
// opts.onNickname(name) runs after a nickname is saved (to refresh the page's own display).
function initSettingsForm(root, opts = {}) {
    const $ = (sel) => root.querySelector(sel);
    const user = doinkUser();
    const say = (el, ok, text) => { el.textContent = text; el.className = 'settings-msg ' + (ok ? 'ok' : 'err'); el.hidden = false; };

    // Nickname: logged in only.
    $('[data-nick-row]').hidden = !user;
    $('[data-nick-loggedout]').hidden = !!user;
    if (user) $('[data-nick]').value = user.username || '';
    $('[data-nick-msg]').hidden = true;
    if (!root.dataset.bound) {
        $('[data-nick-save]').addEventListener('click', async () => {
            const name = $('[data-nick]').value.trim();
            if (!name) return say($('[data-nick-msg]'), false, 'Please enter a nickname');
            const r = await saveNicknameSetting(name);
            say($('[data-nick-msg]'), r.ok, r.message);
            if (r.ok && opts.onNickname) opts.onNickname(name);
        });
        $('[data-tz]').addEventListener('change', async (e) => {
            const r = await saveTimeZoneSetting(e.target.value);
            say($('[data-tz-msg]'), r.ok, r.message);
            if (opts.onTimeZone) opts.onTimeZone(getUserTimeZone());
        });
        root.dataset.bound = '1';
    }

    // Timezone: "Automatic (this device: X)" first, then every zone.
    const sel = $('[data-tz]'), saved = getSavedTimeZone(), device = getDeviceTimeZone();
    const zones = listTimeZones();
    if (saved && !zones.includes(saved)) zones.unshift(saved);
    sel.innerHTML = '';
    sel.add(new Option(`Automatic (this device: ${device || 'unknown'})`, ''));
    zones.forEach((z) => sel.add(new Option(z.replace(/_/g, ' '), z)));
    sel.value = saved;
    $('[data-tz-msg]').hidden = true;
}
