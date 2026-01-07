import {
  IncrementResponse,
  DecrementResponse,
  InitResponse,
} from "../shared/types/api";
import { navigateTo } from "@devvit/web/client";
import { showToast } from '@devvit/web/client';

const counterValueElement = document.getElementById(
  "counter-value"
) as HTMLSpanElement;
const incrementButton = document.getElementById(
  "increment-button"
) as HTMLButtonElement;
const decrementButton = document.getElementById(
  "decrement-button"
) as HTMLButtonElement;

const docsLink = document.getElementById("docs-link") as HTMLDivElement;
const playtestLink = document.getElementById("playtest-link") as HTMLDivElement;
const discordLink = document.getElementById("discord-link") as HTMLDivElement;

const sproingAudio = new Audio("/sproing.mp3");
const doinkAudio = new Audio("/doink.mp3");

docsLink.addEventListener("click", () => {
  navigateTo("https://developers.reddit.com/docs");
});

playtestLink.addEventListener("click", () => {
  navigateTo("https://www.reddit.com/r/Devvit");
});

discordLink.addEventListener("click", () => {
  navigateTo("https://discord.com/invite/R7yu2wh9Qz");
});


let streak = 0;
let highscore = 0;

const titleElement = document.getElementById("title") as HTMLHeadingElement;

let currentPostId: string | null = null;

async function fetchInitialCount() {
  try {
    const response = await fetch("/api/init");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = (await response.json()) as InitResponse;
    if (data.type === "init") {
      counterValueElement.textContent = data.count.toString();
      currentPostId = data.postId; // Store postId for later use
      titleElement.textContent = `Hey ${data.username} 👋`;
    } else {
      console.error("Invalid response type from /api/init", data);
      counterValueElement.textContent = "Error";
    }
  } catch (error) {
    console.error("Error fetching initial count:", error);
    counterValueElement.textContent = "Error";
  }
}

async function updateCounter(action: "increment" | "decrement") {
  if (!currentPostId) {
    console.error("Cannot update counter: postId is not initialized.");
    // Optionally, you could try to re-initialize or show an error to the user.
    return;
  }

  try {
    const response = await fetch(`/api/${action}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // The body can be an empty JSON object or include the postId if your backend expects it,
      // but based on your server code, postId is taken from req.devvit.
      body: JSON.stringify({}),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = (await response.json()) as
      | IncrementResponse
      | DecrementResponse;
    counterValueElement.textContent = data.count.toString();
  } catch (error) {
    console.error(`Error ${action}ing count:`, error);
    // Optionally, display an error message to the user in the UI
  }
}

// --- Button Styling Helpers ---
function resetButtons() {
  const svgButtons = document.querySelectorAll<SVGGElement>('.svgbutton g');
  svgButtons.forEach((button) => {
    button.setAttribute('fill', 'url(#grey)');
  });

  const svgCircles = document.querySelectorAll<SVGCircleElement>('.svgbutton g circle');
  svgCircles.forEach((circle) => {
    circle.setAttribute('stroke', '#bbb');
  });
}

function handleClick(this: SVGGElement) {
  checkPick(this);
}

function enableButtons() {
  const svgButtons = document.querySelectorAll<SVGGElement>('.svgbutton');

  svgButtons.forEach((button) => {
    button.removeEventListener('click', handleClick); // clean first
    button.addEventListener('click', handleClick);
  });
}

function checkPick(button: SVGGElement) {
  const buttonId = parseInt(button.id);

  if (randomPick % 2 == (buttonId % 2)) {
    doCorrectPick(button);
  }
  else {
    doIncorrectPick(button);
  }
}

function doCorrectPick(button: SVGGElement) {
  streak++;

  styleGoodPick(button);

  setTimeout(() => {
    newTurn();
  }, 500);

  doinkAudio.currentTime = 0;
  doinkAudio.play();
}

function doIncorrectPick(button: SVGGElement) {

  if (streak > highscore) {
    highscore = streak;
    showToast(`New High Score: ${highscore} 🎉`);
  }


  styleBadPick(button);

  disableButtons();

  setTimeout(() => {
    newGame();
  }, 500);


  sproingAudio.currentTime = 0;
  sproingAudio.play();

}



function styleGoodPick(button: SVGGElement) {
  // set the fill on g to green
  // queryselector g
  const g = button.querySelector('g');
  if (g) {
    g.setAttribute('fill', 'url(#green)');
    g.querySelector('circle')?.setAttribute('stroke', '#16871a');
  }
  else console.log('No g found');
}


function styleBadPick(button: SVGGElement) {
  console.log(button);
  // set the fill on g to red
  // queryselector g
  const g = button.querySelector('g');
  if (g) {
    g.setAttribute('fill', 'url(#red)');
    g.querySelector('circle')?.setAttribute('stroke', '#af1620');
  }
  else console.log('No g found');

}


function disableButtons() {
  const svgButtons = document.querySelectorAll<SVGGElement>('.svgbutton');
  svgButtons.forEach((button) => {
    const clone = button.cloneNode(true) as SVGGElement;
    button.parentNode?.replaceChild(clone, button);
  });
}

function newGame() {
  streak = 0;
  newTurn();
}
let newTurnCount = 0;
let randomPick = -1;
function newTurn() {

  newTurnCount++;
  console.log('Starting turn number:', newTurnCount);
  resetButtons();
  enableButtons();
  randomPick = Math.floor(Math.random() * 10);

}

function init() {
  // create an audio element and preload it with doink.mp3
  newGame();
}

init();// --- End Button Styling Helpers ---