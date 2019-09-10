import { Component, OnInit, OnDestroy } from '@angular/core';
import { MultiWindowService, Message} from 'ngx-multi-window';
import { Plan } from '../interfaces/plan';
import { OahuPlan } from '../../assets/plans/oahu/plan';
import { MauiPlan } from '../../assets/plans/maui/plan';
import { BigIslandPlan } from '../../assets/plans/bigisland/plan';


@Component({
  selector: 'app-second-screen',
  templateUrl: './second-screen.component.html',
  styleUrls: ['./second-screen.component.css']
})

/** This component controls the second monitor.  It is a second DOM so all of the data has to be
 * on this page because the main application cannot communicate with it in the same way that it
 * communicates with other components.
 */
export class SecondScreenComponent implements OnInit {

  private currentYear: number;
  private displayName: string;
  private secondScreenImagePath: string;
  private nextLayer: string;
  private plan: Plan;
  private mapLayers: {text: string, color: string, active: boolean}[] = [];

  constructor(private multiWindowService: MultiWindowService) {
    multiWindowService.name = 'secondScreen';
  }

  ngOnInit() {
    this.multiWindowService.onMessage().subscribe((value: Message) => {
      const data = JSON.parse(value.data);
      if (data.type === 'setup') {
        this.setupSecondScreen(data);
      } else if (data.type === 'year') {
        this.currentYear = data.year;
      } else if (data.type === 'layer') {
        this.nextLayer = data.name;
      }
    });
  }

  ngOnDestroy(): void {
    this.multiWindowService.name = 'dead';
  }

  /** Initializes the second screen when it is opened.  Since data cannot be passed, the possible maps have to be
   * hard coded into the logic.
   * @param data => The setup object
   */
  private setupSecondScreen(data: any): void {
    this.currentYear = data.currentYear;
    switch (data.name) {
      case 'oahu':
        this.plan = OahuPlan;
        break;
      case 'maui':
        this.plan = MauiPlan;
        break;
      case 'bigisland':
        this.plan = BigIslandPlan;
        break;
      default:
        this.plan = OahuPlan;
        break;
    }
    this.nextLayer = this.plan.map.mapLayers[0].name;
    this.plan.map.mapLayers.forEach(layer => {
      this.mapLayers.push({text: layer.displayName, color: layer.fillColor, active: false});
    });
  }
}
