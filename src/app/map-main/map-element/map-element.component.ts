import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { PlanService } from '../../services/plan.service';
import { MapDirective } from './map.directive';
import * as d3 from 'd3';
import { MapLayer, Parcel } from '@app/interfaces';

@Component({
  selector: 'app-map-element',
  templateUrl: './map-element.component.html',
  styleUrls: ['./map-element.component.css']
})

export class MapElementComponent implements OnInit {

  scale: number;
  width: number;
  height: number;
  rasterBounds: any[];
  baseMapImagePath: string;

  projection: d3.geo.Projection;
  path: d3.geo.Path;
  map: d3.Selection<any>;


  @ViewChild('mapDiv', { static: true }) mapDiv: ElementRef;

  @ViewChild(MapDirective, { static: true }) mapElement;

  constructor(private planService: PlanService) {
    this.scale = planService.getMapScale();
    this.width = planService.getMapImageWidth() * this.scale;
    this.height = planService.getMapImageHeight() * this.scale;
    this.rasterBounds = planService.getMapBounds();
    this.baseMapImagePath = planService.getBaseMapPath();
  }

  ngOnInit() {
    this.projection = d3.geo.mercator()
      .scale(1)
      .translate([0, 0]);

    this.path = d3.geo.path()
      .projection(this.projection);

    this.map = d3.select(this.mapDiv.nativeElement).append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    this.map.append('image')
      .attr('xlink:href', `${this.baseMapImagePath}`)
      .attr('width', this.width)
      .attr('height', this.height);

    this.planService.getLayers().forEach(layer => {
      if (layer.filePath === null) {
        return;
      }
      d3.json(`${layer.filePath}`, (error, geoData) => {
        const bounds = [this.projection(this.rasterBounds[0]), this.projection(this.rasterBounds[1])];
        const scale = 1 / Math.max((bounds[1][0] - bounds[0][0]) / this.width, (bounds[1][1] - bounds[0][1]) / this.height);
        const transform = [
          (this.width - scale * (bounds[1][0] + bounds[0][0])) / 2,
          (this.height - scale * (bounds[1][1] + bounds[0][1])) / 2
        ] as [number, number];

        const proj = d3.geo.mercator()
          .scale(scale)
          .translate(transform);

        const path = d3.geo.path()
          .projection(proj);

        this.map.selectAll(layer.name)
          .data(geoData.features)
          .enter().append('path')
          .attr('d', path)
          .attr('class', layer.name)
          .each(function (d) {
            layer.parcels.push({ path: this, properties: (d.hasOwnProperty(`properties`)) ? d[`properties`] : null } as Parcel);
          }).call(() => {
            if (layer.setupFunction !== null) {
              layer.setupFunction(this.planService);
            } else {
              this.defaultFill(layer);
            }
          });
      });
    });

    // Subscribe to layer toggling
    this.planService.toggleLayerSubject.subscribe((layer) => {
      if (layer.updateFunction !== null) {
        layer.updateFunction(this.planService);
      } else {
       this.defaultFill(layer);
      }
    });

    this.planService.updateLayerSubject.subscribe((layer) => {
      if (layer.updateFunction !== null) {
        layer.updateFunction(this.planService);
      } else {
        //this.defaultFill(layer);
      }
    });

    this.planService.yearSubject.subscribe((year) => {
      const layers = this.planService.getLayers();
      layers.forEach(layer => {
        if (layer.updateFunction !== null && layer.active) {
            layer.updateFunction(this.planService);
        } else {
         //this.defaultFill(layer);
        }
      });
    });
  }

  defaultFill(layer: MapLayer) {
    layer.parcels.forEach(el => {
      d3.select(el.path)
        .style('fill', layer.fillColor)
        .style('opacity', layer.active ? 0.85 : 0.0)
        .style('stroke', layer.borderColor)
        .style('stroke-width', layer.borderWidth + 'px');
    });
  }
}
