// Base interface that all game types must implement
export interface IDoinkGame {
  name: string;
  description?: string;
  
  // Initialize the game
  init(args?: GameInitArgs): Promise<void> | void;
  
  // Handle player action (button click)
  action(buttonElement: SVGSVGElement): void;
  
  // Start a new turn/round
  newTurn(): void;
  
  // End the current game
  endGame(): void;
  
  // Update UI with current state
  renderUI(): void;
}

export interface GameInitArgs {
  postId?: string;
  username?: string;
  bestScore?: number;
  [key: string]: any;
}

export interface GameState {
  streak: number;
  bestScore: number;
  winner: string | boolean | null;
  isPlaying: boolean;
}
