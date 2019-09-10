import { Component, OnInit } from '@angular/core';
import { PlanService } from '../../services/plan.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-large-year',
  templateUrl: './large-year.component.html',
  styleUrls: ['./large-year.component.css']
})
export class LargeYearComponent implements OnInit {

  currentYear: number;

  constructor(private planService: PlanService) {
    this.currentYear = planService.getCurrentYear();
  }

  ngOnInit() {
      this.planService.yearSubject.subscribe({
        next: value => {
          this.currentYear = value;
        }
      });
  }

}
