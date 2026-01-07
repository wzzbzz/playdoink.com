// Central engine that manages switching between modes
const gameTypes = {
  classic: null,    // will be injected from classicGame.js
  challenge: null,  // will be injected
  battle: null,     // will be injected
  megadoink: null, //will be injected
  spectator:null
};

const rooms = {
  chat: null, // will be injected from chatRoom.js
  colosseum: null // will be injected from colosseumRoom.js
};

let currentGame = null;
let currentRoom = null;

// Load a specific game type
function loadGame(type, args = {}) {
  if (!gameTypes[type]) throw new Error("Unknown game type: " + type);
  currentGame = gameTypes[type];
  currentGame.init(args);
}

// Forward button clicks to the active game
function checkPick(pick) {
  if (currentGame && typeof currentGame.action === "function") {
    currentGame.action(pick);
  }
}

function loadRoom(type) {
  if (!rooms[type]) throw new Error("Unknown room type: " + type);
  currentRoom = rooms[type];
  currentRoom.init();
}


