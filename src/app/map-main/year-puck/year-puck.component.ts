import { Component, HostListener, AfterViewInit, ViewChildren, ViewChild } from '@angular/core';
import { PlanService } from '../../services/plan.service';

@Component({
  selector: 'app-year-puck',
  templateUrl: './year-puck.component.html',
  styleUrls: ['./year-puck.component.css']
})
export class YearPuckComponent implements AfterViewInit {

  @ViewChildren('yearBoxWrapper') yearBoxes;
  @ViewChild('yearBoxWrapper', {static: false}) yearBoxWrapper;

  private numberOfYears: number;
  private years: {year: number, filled: boolean}[] = [];
  private currentYear: number;
  private angle: number;
  private yearBoxElements: any[];
  private currentPosition: number;
  private YEAR_PUCK_COLOR: string = 'rgba(147, 93, 201)';

  constructor(private planService: PlanService) {
    this.currentPosition = 0;
    this.currentYear = this.planService.getMinimumYear();
    this.numberOfYears = this.planService.getMaximumYear() - this.planService.getMinimumYear() + 1;
    for (let i = 0; i < this.numberOfYears; i++) {
      this.years.push({year: i + this.planService.getMinimumYear(), filled: false});
    }
   }

  ngAfterViewInit() {
    this.yearBoxElements = this.yearBoxes.first.nativeElement.children;
    this.positionElements(this.yearBoxElements);
    this.colorNodes();

    this.planService.yearSubject.subscribe(year => {
      this.currentYear = year;
      this.colorNodes();
    })
  }


  /** Colors each of the year nodes.
   * 
   */
  private colorNodes() {
    for (let index = 0; index < this.numberOfYears; index++) {
      if (index <= this.currentYear - this.planService.getMinimumYear()) {
        this.yearBoxElements[index].style.backgroundColor = this.YEAR_PUCK_COLOR;
      } else {
        this.yearBoxElements[index].style.backgroundColor = 'transparent';
      }
    }
  }

  /** Positions the nodes around the puck
   * @param elements the HTML elements to position.
   */
  private positionElements(elements) {
    this.angle = 360 / elements.length;
    this.currentPosition = 0;

    for (const e of elements) {
      e.style.transform = `rotate(${this.currentPosition}deg) translate(55px)`;
      this.currentPosition += this.angle;
    }

    this.yearBoxWrapper.nativeElement.style.transform = 'rotate(-90deg)';
  }
}
