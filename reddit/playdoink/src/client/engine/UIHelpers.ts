/**
 * UI Helper utilities for button styling and DOM manipulation
 */
export class UIHelpers {
  /**
   * Reset all buttons to default grey state
   */
  static resetButtons(): void {
    const groups = document.querySelectorAll<SVGGElement>('.svgbutton g');
    groups.forEach((g) => {
      g.setAttribute('fill', 'url(#grey)');
    });
    
    const circles = document.querySelectorAll<SVGCircleElement>('.svgbutton g circle');
    circles.forEach((circle) => {
      circle.setAttribute('stroke', '#bbb');
    });
  }
  
  /**
   * Style a button as a correct pick (green)
   */
  static styleGoodPick(button: SVGSVGElement): void {
    // Chain directly to avoid stale references
    button.querySelector('g')?.setAttribute('fill', 'url(#green)');
    button.querySelector('g circle')?.setAttribute('stroke', '#16871a');
  }
  
  /**
   * Style a button as an incorrect pick (red)
   */
  static styleBadPick(button: SVGSVGElement): void {
    console.log('Styling bad pick in UIHelpers...');
    // Chain directly to avoid stale references
    button.querySelector('g')?.setAttribute('fill', 'url(#red)');
    button.querySelector('g circle')?.setAttribute('stroke', '#af1620');
  }
  
  /**
   * Enable button click handlers
   */
  static enableButtons(handler: (button: SVGSVGElement) => void): void {
    const buttons = document.querySelectorAll<SVGSVGElement>('.svgbutton');
    buttons.forEach((button) => {
      button.style.cursor = 'pointer';
      button.addEventListener('click', () => handler(button));
    });
  }
  
  /**
   * Disable all button click handlers
   */
  static disableButtons(): void {
    const buttons = document.querySelectorAll<SVGSVGElement>('.svgbutton');
    buttons.forEach((button) => {
      button.style.cursor = 'default';
      // Clone and replace to remove all event listeners
      const clone = button.cloneNode(true) as SVGSVGElement;
      button.parentNode?.replaceChild(clone, button);
    });
  }
}
