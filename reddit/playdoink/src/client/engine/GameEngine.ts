import { IDoinkGame, GameInitArgs } from './IDoinkGame';

/**
 * GameEngine - Central engine that manages game types and routing
 */
export class GameEngine {
  private games: Map<string, IDoinkGame> = new Map();
  private currentGame: IDoinkGame | null = null;
  
  /**
   * Register a new game type
   */
  registerGame(type: string, game: IDoinkGame): void {
    this.games.set(type, game);
    console.log(`Game registered: ${type} - ${game.name}`);
  }
  
  /**
   * Load and initialize a specific game type
   */
  async loadGame(type: string, args?: GameInitArgs): Promise<void> {
    const game = this.games.get(type);
    
    if (!game) {
      throw new Error(`Unknown game type: ${type}`);
    }
    
    this.currentGame = game;
    await game.init(args);
    console.log(`Game loaded: ${type}`);
  }
  
  /**
   * Forward button click to the active game
   */
  handleAction(buttonElement: SVGSVGElement): void {
    if (!this.currentGame) {
      console.warn('No active game to handle action');
      return;
    }
    
    this.currentGame.action(buttonElement);
  }
  
  /**
   * Get the currently active game
   */
  getCurrentGame(): IDoinkGame | null {
    return this.currentGame;
  }
  
  /**
   * Get all registered games
   */
  getRegisteredGames(): string[] {
    return Array.from(this.games.keys());
  }
}

// Export singleton instance
export const gameEngine = new GameEngine();
