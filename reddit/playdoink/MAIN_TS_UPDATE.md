# Main.ts Update - Game Engine Integration

## Changes Made

### 1. New main.ts Structure
- **Removed**: Old game logic (streak tracking, button handlers, etc.)
- **Added**: GameEngine integration
- **Keeps**: Footer links, play again button setup

### 2. Initialization Flow
```
init() → fetch /api/init → register ClassicGame → load game with data
```

### 3. What main.ts Now Does
- Sets up footer navigation links (docs, playtest, discord)
- Fetches initialization data from server
- Registers ClassicGame with the GameEngine
- Loads the game with proper initialization args
- Handles "play again" button by re-initializing current game

### 4. What main.ts Does NOT Do Anymore
- ❌ Direct button click handling (now in GameEngine)
- ❌ Game state management (now in ClassicGame)
- ❌ UI styling (now in UIHelpers)
- ❌ Audio management (now in ClassicGame)

## Server Updates

### Updated InitResponse Type
- Made `total_rounds` and `average_streak` optional
- Ensures `username` and `highest_streak` are always present

### Updated Server Endpoint
- Now fetches `highest_streak` from Redis
- Returns it in the init response for game initialization

## How It Works Now

1. **App Loads** → main.ts `init()` runs
2. **Fetch Data** → GET /api/init returns postId, username, highest_streak
3. **Register Game** → Creates new ClassicGame instance and registers it
4. **Load Game** → Passes init data to ClassicGame
5. **Game Runs** → ClassicGame handles all game logic
6. **Play Again** → Calls current game's init() method again

## Next Steps
- Add score submission endpoint to server
- Add leaderboard endpoint to server
- Integrate leaderboard into ClassicGame.showEndScreen()
