const canvas = document.getElementById("arena");
const ctx = canvas.getContext("2d");
const container = document.getElementById("game-container");

// Canvas resolution
function resizeCanvas() {
    canvas.width = container.clientWidth;
    canvas.height = Math.floor(container.clientWidth * 0.5);
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Images
const background = new Image();
background.src = "/resources/colosseum-2x.png";

const green = new Image();
green.src = "/resources/green-orb-transparent.png";

const red = new Image();
red.src = "/resources/red-orb-transparent.png";

let imagesLoaded = 0;
const totalImages = 3;

function checkAllLoaded() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        draw();
        updateHitboxes();
    }
}
background.onload = checkAllLoaded;
green.onload = checkAllLoaded;
red.onload = checkAllLoaded;


let you = document.cookie.split('; ').find(row => row.startsWith('doink_nickname=')).split('=')[1];
console.log(you);
// Players (green)
let players = {};
// players["jim"] = {
//     x: 100,
//     y: 50,
//     w: 64,
//     h: 64,
//     name: "Jim"
// };

// NPCs (red)
let npcs = {};
npcs["crimsonius"] = {
    x: 250,
    y: 120,
    w: 64,
    h: 64,
    name: "Crimsonius"
};


function addPlayer(name) {
    console.log("players", players);
    if (players[name]) return; // already exists

    // find all of the existing players, and positions.
    const positions = Object.values(players).map(p => ({
        x: p.x,
        y: p.y
    }));
    // pick a new spot that doesn't overlap
    let x, y;
    let attempts = 0;
    do {
        x = Math.floor(Math.random() * (canvas.width - 64));
        y = Math.floor(Math.random() * (canvas.height - 64));
        attempts++;
        if (attempts > 100) {
            alert('room is full');
            break;
        }; // prevent infinite loop
    } while (positions.some(p => Math.abs(p.x - x) < 70 &&
        Math.abs(p.y - y) < 70));


    players[name] = {
        x,
        y,
        w: 64,
        h: 64,
        name
    };
}

function showFlashMessage(msg, duration = 2000) {
    const flash = document.getElementById("flash-message");
    flash.textContent = msg;
    flash.style.opacity = "1";

    setTimeout(() => {
        flash.style.opacity = "0";
    }, duration);
}

function doHighFive(data) {
    console.log(data);
    // show a flash message saying who's high fived who
    showFlashMessage(`${data.source} high-fived ${data.target} ✋`, 2000);
    sounds.highfive.play();
}

// Draw loop
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // Draw players (green)
    Object.keys(players).forEach(uid => {
        const u = players[uid];
        ctx.drawImage(green, u.x, u.y, u.w, u.h);
        ctx.fillStyle = "#fff";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.fillText(u.name, u.x + u.w / 2, u.y - 5);
    });

    // Draw NPCs (red)
    Object.keys(npcs).forEach(nid => {
        const n = npcs[nid];
        ctx.drawImage(red, n.x, n.y, n.w, n.h);
        ctx.fillStyle = "#ffaaaa";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.fillText(n.name, n.x + n.w / 2, n.y - 5);
    });

    requestAnimationFrame(draw);
}

// Hitboxes
function updateHitboxes() {
    // Clear old hitboxes
    document.querySelectorAll(".sprite-hitbox").forEach(el => el.remove());

    // Players
    Object.keys(players).forEach(uid => {
        const u = players[uid];
        const hit = document.createElement("div");
        hit.className = "sprite-hitbox";
        hit.dataset.username = u.name;
        hit.dataset.type = "player";
        hit.style.left = u.x + "px";
        hit.style.top = u.y + "px";
        hit.style.width = u.w + "px";
        hit.style.height = u.h + "px";
        container.appendChild(hit);
    });

    // NPCs
    Object.keys(npcs).forEach(nid => {
        const n = npcs[nid];
        const hit = document.createElement("div");
        hit.className = "sprite-hitbox";
        hit.dataset.username = n.name;
        hit.dataset.type = "npc";
        hit.style.left = n.x + "px";
        hit.style.top = n.y + "px";
        hit.style.width = n.w + "px";
        hit.style.height = n.h + "px";
        container.appendChild(hit);
    });
}
setInterval(updateHitboxes, 1000);

// Context menu
const menu = document.getElementById("sprite-menu");
let activeTarget = null;

container.addEventListener("click", (e) => {
    if (e.target.classList.contains("sprite-hitbox")) {
        activeTarget = {
            name: e.target.dataset.username,
            type: e.target.dataset.type
        };
        const rect = e.target.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        menu.style.left = (rect.left - containerRect.left + rect.width + 5) + "px";
        menu.style.top = (rect.top - containerRect.top) + "px";
        menu.style.display = "block";
    }
});

// Menu actions
document.querySelectorAll(".menu-item").forEach(item => {
    item.addEventListener("click", () => {
        if (item.textContent === "Look" && activeTarget) {
            // if it's you, say "It's you!"
            if (activeTarget.name === you) {
                alert("It's you!");
            } else {
                alert("It's " + activeTarget.name + " (" + activeTarget.type + ")");
            }
        }
        if (item.textContent === "Challenge" && activeTarget) {
            alert("You challenge " + activeTarget.name + "!");
        }
        if (item.textContent === "High Five" && activeTarget) {
            fetch(`https://app.playdoink.com/highfive/${roomId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    source: user,
                    target: activeTarget.name
                })
            });

        }
        menu.style.display = "none";
    });
});

// Hide menu outside
document.addEventListener("click", (e) => {
    if (!e.target.closest(".sprite-hitbox") && !e.target.closest("#sprite-menu")) {
        menu.style.display = "none";
    }
});