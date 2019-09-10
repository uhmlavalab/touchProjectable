import { Component, ViewChildren, AfterViewInit } from '@angular/core';
import { MapLayer } from '@app/interfaces';
import { LegendDirective } from './legend.directive';
import { chartColors, mapLayerColors } from '../../../assets/plans/defaultColors';
import { _ } from 'underscore';
import { PlanService } from '@app/services/plan.service';

@Component({
  selector: 'app-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.css']
})
export class LegendComponent implements AfterViewInit {

  layers: MapLayer[];
  width: number;
  private legendClass: string;

  @ViewChildren(LegendDirective) legendElements;

  constructor(private planService: PlanService) {
    this.layers = this.planService.getLayers();
    this.legendClass = this.planService.getCurrentLegendLayout();
  }

  ngAfterViewInit() {
    this.planService.legendSubject.subscribe({
      next: value => {
        this.legendClass = value;
      }
    });
  }


  /** Changes the background of a mini-card when that layer is either added or
   * removed from the map.
   * @param layer => The layer that was added or removed.
   */
  private getBackgroundColor(layer: MapLayer): string {
    return layer.legendColor;
  }

  /** Gets the correct width of the colored background.  Changes depending
   * on whether the legend is vertical or grid.
   * @param active => Is the layer card active or not
   */
  private getStyle(active: boolean): object {
    if (this.legendClass === 'vertical') {
      return active ? {
        width: '70px',
        height: '70px',
        left: '9px',
        marginTop: '0px'
      } : { width: '0px', height: '0px', left: '35px', marginTop: '35px' };
    } else if (this.legendClass === 'grid') {
      return active ? { width: '50%', height: '100%', left: '0px' } : { width: '0%', height: '0%', left: '0px' };
    }
  }
}
