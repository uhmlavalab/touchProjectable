import { Component, OnInit } from '@angular/core';
import { PlanService } from '../services/plan.service';
import { Scenario } from '../interfaces/scenario';

@Component({
  selector: 'app-scenario',
  templateUrl: './scenario.component.html',
  styleUrls: ['./scenario.component.css']
})

/** This component is used to display the current Scenario on the map. */
export class ScenarioComponent implements OnInit {

  private scenarios: Scenario[] = []; // Array Holding All Scenarios
  private scenario: Scenario;
  private scenarioIndex: number;

  constructor(private planService: PlanService) {

    try {
      this.scenarios = this.planService.getScenarios();
      this.scenarioIndex = 0;
      this.scenario = this.scenarios[this.scenarioIndex];
    } catch (error) {
      console.log('error fetching scenarios');
    }
  }

  ngOnInit() {

    // Subscribe to Scenarios
    this.planService.scenarioSubject.subscribe({
      next: value => {
        this.scenario = value;
        this.scenarioIndex = this.scenarios.indexOf(this.scenario);
      }
    });
  }

}
