import { IDoinkGame, GameInitArgs, GameState } from '../engine/IDoinkGame';
import { UIHelpers } from '../engine/UIHelpers';
import { showToast } from '@devvit/web/client';

/**
 * ClassicGame - The original 2-button DO!NK game
 */
export class ClassicGame implements IDoinkGame {
  name = "Classic DO!NK";
  description = "The classic DO!NK experience - pick the right button!";
  
  private state: GameState = {
    streak: 0,
    bestScore: 0,
    winner: null,
    isPlaying: false
  };
  
  private postId: string | null = null;
  private username: string = "anonymous";
  
  // Audio elements
  private doinkAudio = new Audio("/doink.mp3");
  private sproingAudio = new Audio("/sproing.mp3");
  
  // DOM elements
  private resultsWrap: HTMLDivElement | null = null;
  private yourScoreSpan: HTMLSpanElement | null = null;
  private bestRunSpan: HTMLSpanElement | null = null;
  
  async init(args?: GameInitArgs): Promise<void> {
    // Store initialization args
    this.postId = args?.postId || null;
    this.username = args?.username || "anonymous";
    this.state.bestScore = args?.bestScore || 0;
    
    // Cache DOM elements
    this.resultsWrap = document.getElementById("resultswrap") as HTMLDivElement;
    this.yourScoreSpan = document.getElementById("yourscore") as HTMLSpanElement;
    this.bestRunSpan = document.getElementById("bestrun") as HTMLSpanElement;
    
    // Hide results modal
    if (this.resultsWrap) {
      this.resultsWrap.style.display = 'none';
    }
    
    // Setup audio callback
    this.doinkAudio.addEventListener('ended', () => this.newTurn());
    
    // Reset state
    this.state.streak = 0;
    this.state.isPlaying = true;
    
    // Start the game
    this.newTurn();
    this.renderUI();
    
    console.log(`${this.name} initialized for ${this.username}`);
  }
  
  newTurn(): void {
    if (!this.state.isPlaying) return;
    
    // Enable buttons with action handler
    UIHelpers.enableButtons((button) => this.action(button));
    UIHelpers.resetButtons();
    
    // Randomly select winner: 40% button 1, 40% button 2, 20% both win
    const random = Math.random();
    if (random < 0.4) {
      this.state.winner = "button_1";
    } else if (random < 0.8) {
      this.state.winner = "button_2";
    } else {
      this.state.winner = true; // Both buttons win
    }
  }
  
  action(buttonElement: SVGSVGElement): void {
    console.log('action() called with button:', buttonElement);
    console.log('button ID:', buttonElement?.getAttribute('id'));
    
    const buttonId = buttonElement.getAttribute('id');
    const isCorrect = this.state.winner === true || buttonId === this.state.winner;
    
    console.log('buttonId:', buttonId, 'winner:', this.state.winner, 'isCorrect:', isCorrect);
    
    if (isCorrect) {
      this.handleCorrect(buttonElement);
    } else {
      this.handleIncorrect(buttonElement);
    }
  }
  
  private handleCorrect(button: SVGSVGElement): void {
    console.log('handleCorrect called', button);
    this.state.streak++;
    
    // Update best score if needed
    if (this.state.streak > this.state.bestScore) {
      this.state.bestScore = this.state.streak;
    }
    
    // Visual feedback BEFORE disabling
    console.log('Styling good pick...');
    UIHelpers.styleGoodPick(button);
    this.renderUI();
    
    // THEN disable buttons
    UIHelpers.disableButtons();
    
    // Play sound (newTurn will be called when sound ends)
    this.doinkAudio.currentTime = 0;
    this.doinkAudio.play();
  }
  
  private handleIncorrect(button: SVGSVGElement): void {
    this.state.isPlaying = false;
    
    // Visual feedback BEFORE disabling
    UIHelpers.styleBadPick(button);
    
    // THEN disable buttons
    UIHelpers.disableButtons();
    
    // Play sound
    this.sproingAudio.currentTime = 0;
    this.sproingAudio.play();
    
    // End game after short delay
    setTimeout(() => this.endGame(), 250);
  }
  
  async endGame(): Promise<void> {
    // Submit score to backend
    await this.submitScore(this.state.streak);
    
    // Show end screen with leaderboard
    this.showEndScreen();
  }
  
  private async submitScore(score: number): Promise<void> {
    if (score === 0) return;
    
    try {
      const response = await fetch('/api/submit-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          postId: this.postId,
          score: score 
        })
      });
      
      if (response.ok) {
        console.log('Score submitted:', score);
      }
    } catch (error) {
      console.error('Failed to submit score:', error);
    }
  }
  
  private showEndScreen(): void {
    if (this.yourScoreSpan) {
      this.yourScoreSpan.textContent = this.state.streak.toString();
    }
    if (this.bestRunSpan) {
      this.bestRunSpan.textContent = this.state.bestScore.toString();
    }
    if (this.resultsWrap) {
      this.resultsWrap.style.display = 'block';
    }
    
    // Show achievement toast if new high score
    if (this.state.streak > 0 && this.state.streak === this.state.bestScore) {
      showToast(`🎉 New High Score: ${this.state.bestScore}!`);
    }
    
    // TODO: Load and display leaderboard here
  }
  
  renderUI(): void {
    // This could update a live score display if we add one
    console.log(`Streak: ${this.state.streak}, Best: ${this.state.bestScore}`);
  }
}
