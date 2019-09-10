import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appMap]'
})
export class MapDirective {

  constructor(private element: ElementRef) { }

  public setWidth(width): void {
    this.element.nativeElement.style.width = width;
  }

  public setHeight(height): void {
    this.element.nativeElement.style.height = height;
  }

}
