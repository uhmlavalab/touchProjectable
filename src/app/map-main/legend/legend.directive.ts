import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appLegend]'
})

export class LegendDirective {

  constructor(private element: ElementRef) {

  }

  setBackgroundColor(color) {
    this.element.nativeElement.style.backgroundColor = color;
  }

}
