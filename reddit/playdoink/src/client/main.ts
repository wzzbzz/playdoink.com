import { InitResponse } from "../shared/types/api";
import { navigateTo } from "@devvit/web/client";
import { gameEngine } from './engine/GameEngine';
import { ClassicGame } from './games/ClassicGame';

// DOM elements
const docsLink = document.getElementById("docs-link") as HTMLDivElement;
const playtestLink = document.getElementById("playtest-link") as HTMLDivElement;
const discordLink = document.getElementById("discord-link") as HTMLDivElement;
const playAgainButton = document.getElementById("playagain") as HTMLButtonElement;

// Event listeners for footer links
if (docsLink) {
  docsLink.addEventListener("click", () => {
    navigateTo("https://developers.reddit.com/docs");
  });
}

if (playtestLink) {
  playtestLink.addEventListener("click", () => {
    navigateTo("https://www.reddit.com/r/Devvit");
  });
}

if (discordLink) {
  discordLink.addEventListener("click", () => {
    navigateTo("https://discord.com/invite/R7yu2wh9Qz");
  });
}

if (playAgainButton) {
  playAgainButton.addEventListener("click", () => {
    startGame();
  });
}

/**
 * Initialize the application
 */
async function init(): Promise<void> {
  try {
    // Fetch initial game data from server
    const response = await fetch("/api/init");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json() as InitResponse;
    
    if (data.type === "init") {
      // Register the classic game
      const classicGame = new ClassicGame();
      gameEngine.registerGame('classic', classicGame);
      
      // Load the game with initialization data
      await gameEngine.loadGame('classic', {
        postId: data.postId,
        username: data.username,
        bestScore: data.highest_streak || 0
      });
      
      console.log('Game initialized successfully');
    } else {
      console.error('Invalid response type from /api/init', data);
    }
  } catch (error) {
    console.error("Error initializing game:", error);
  }
}

/**
 * Start a new game (used by play again button)
 */
async function startGame(): Promise<void> {
  const currentGame = gameEngine.getCurrentGame();
  if (currentGame) {
    // Re-initialize the current game
    await currentGame.init();
  }
}

// Start the app when DOM is ready
init();
