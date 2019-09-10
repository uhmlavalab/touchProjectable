import { Component, OnInit } from '@angular/core';
import { PlanService } from '../../services/plan.service';

@Component({
  selector: 'app-add-puck',
  templateUrl: './add-puck.component.html',
  styleUrls: ['./add-puck.component.css']
})
export class AddPuckComponent implements OnInit {

  private selectedLayer: {
    icon: string;
    active: boolean;
    text: string;
    color: string;
  }

  private addRemoveText: string;

  constructor(private planService: PlanService) {
    this.selectedLayer = {
      icon: this.planService.getSelectedLayer().iconPath,
      active: this.planService.getSelectedLayer().active,
      text: this.planService.getSelectedLayer().displayName,
      color: this.planService.getSelectedLayer().legendColor
    }

    this.setAddRemoveText();
   }

  ngOnInit() {

    // Subscribe to layer toggling
    this.planService.selectedLayerSubject.subscribe((layer) => {
      this.selectedLayer = {
        icon: layer.iconPath,
        active: layer.active,
        text: layer.displayName,
        color: layer.legendColor
      }
      this.setAddRemoveText();
    });

    // Subscribe to layer toggling
    this.planService.toggleLayerSubject.subscribe((layer) => {
      this.selectedLayer = {
        icon: layer.iconPath,
        active: layer.active,
        text: layer.displayName,
        color: layer.legendColor
      }
      this.setAddRemoveText();
    });
    
  }

  private setAddRemoveText(): void {
    this.addRemoveText = this.selectedLayer.active ? 'Remove' : 'Add';
  }
}
