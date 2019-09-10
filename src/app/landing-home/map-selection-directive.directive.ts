import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appMapSelectionDirective]'
})
export class MapSelectionDirectiveDirective implements OnInit {

  @Input() mapStartLeftVal: number;

  constructor(private element: ElementRef) {
 }

  ngOnInit() {
  }

  /**
  * This function slides one of the elements that are referenced with this
  * directive to a specific location.
  * @param value => the value of the css left position.
  * @param element => the selected element.
  * @return none
  */
  elementalSlide(value: any) {
    this.element.nativeElement.style.left = `${value}%`;
  }

}
