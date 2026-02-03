# DO!NK Game Engine Architecture

## Overview
Improved TypeScript architecture for the DO!NK Reddit game, designed to support multiple game varieties.

## Structure

### Core Engine (`/engine`)
- **IDoinkGame.ts** - Interface defining the contract all games must implement
- **GameEngine.ts** - Central singleton that manages game registration and routing
- **UIHelpers.ts** - Shared UI utilities for button styling and DOM manipulation

### Games (`/games`)
- **ClassicGame.ts** - Implementation of the classic 2-button DO!NK game
- Future games can be added here (ChallengeGame, BattleGame, MegadoinkGame, etc.)

## Key Improvements Over Original Frontend

1. **Type Safety**
   - Full TypeScript with interfaces
   - Compile-time checking for game implementations
   - No more runtime errors from missing methods

2. **Better Encapsulation**
   - Each game is a class with private state
   - No global variables polluting the namespace
   - Clear separation of concerns

3. **Dependency Injection**
   - Games receive initialization args (postId, username, etc.)
   - Easy to test and mock

4. **Single Responsibility**
   - UIHelpers handles all DOM manipulation
   - Games focus on game logic only
   - Clear boundaries between components

5. **Extensibility**
   - Simple interface to implement new games
   - Register games with engine.registerGame()
   - Swap games easily

## Usage Example

```typescript
import { gameEngine } from './engine/GameEngine';
import { ClassicGame } from './games/ClassicGame';

// Register the classic game
const classicGame = new ClassicGame();
gameEngine.registerGame('classic', classicGame);

// Load and start the game
await gameEngine.loadGame('classic', {
  postId: '123',
  username: 'player1',
  bestScore: 42
});

// Handle button clicks
button.addEventListener('click', () => {
  gameEngine.handleAction(button);
});
```

## Next Steps
- Add leaderboard integration to ClassicGame.showEndScreen()
- Create backend API endpoint for score submission and leaderboard retrieval
- Update main.ts to use the new engine
- Add more game varieties
