import { Component, OnInit } from '@angular/core';
import { PlanService } from '../../services/plan.service';

@Component({
  selector: 'app-title',
  templateUrl: './title.component.html',
  styleUrls: ['./title.component.css']
})
export class TitleComponent implements OnInit {

  constructor(private planService: PlanService) { }

  ngOnInit() {
  }

  /** Gets the title of the map
  * @return the name of the map
  */
  getTitle(): string {
    return this.planService.getCurrentPlan().displayName;
  }
}
