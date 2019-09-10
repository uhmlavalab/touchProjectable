import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appCardStyle]'
})

export class CardStyleDirective {

  constructor(private element: ElementRef) {
  }

  /** Changes the background color of the mini-card
  * @param color the new background color
  **/
  changeBackgroundColor(color): void {
    this.element.nativeElement.style.backgroundColor = color;
  }

  /** Changes the height of the mini-card.  When the card is
  * active, the height is increased.  If it is not active, the card
  * height is returned to normal.
  * @param height the height to set the card.
  */
  setCardHeight(height): void {
    this.element.nativeElement.style.height = height;
  }

}
