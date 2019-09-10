import { Component, AfterViewInit, ViewChildren, ViewChild, HostListener } from '@angular/core';
import { PlanService } from '../../services/plan.service';

@Component({
  selector: 'app-layer-puck',
  templateUrl: './layer-puck.component.html',
  styleUrls: ['./layer-puck.component.css']
})
export class LayerPuckComponent implements AfterViewInit {

  @ViewChildren('iconContainer') icons;
  @ViewChildren('slideIconContainer') slideIcons;
  @ViewChild('iconContainer', { static: false }) iconContainer;
  @ViewChild('layerPuckContainer', { static: false }) puckContainer;

  private numberOfIcons: number;
  private iconImages: { icon: string, text: string, image: string, active: boolean, color: string}[] = [];
  private currentIcon: { icon: string, text: string, image: string, active: boolean, color: string};
  private currentIconIndex: number;
  private iconElements: any[] = [];
  private currentPosition: number;
  private angle: number;
  private addRemove: string;

  constructor(private planService: PlanService) {
    this.iconImages = [];
    this.planService.getCurrentPlan().map.mapLayers.forEach(layer => {
      this.iconImages.push({
        icon: layer.iconPath,
        text: layer.displayName,
        image: layer.iconPath,
        active: false,
        color: layer.legendColor
      });
    });


    this.currentIconIndex = 0;
    this.currentIcon = this.iconImages[this.currentIconIndex];
   }

  ngAfterViewInit() {
    this.iconElements = this.icons.first.nativeElement.children;
    this.positionElements(this.iconElements);

    this.planService.layerChangeSubject.subscribe(direction => {
      this.cycle(direction);
    });

    this.planService.resetLayersSubject.subscribe(emptySet => {
      this.iconImages = emptySet;
      this.iconElements = emptySet;
    });
    
  // Subscribe to layer toggling
  this.planService.toggleLayerSubject.subscribe((layer) => {
    if (!layer.active) {
      this.iconElements[this.currentIconIndex].style.opacity = 1;
      this.currentIcon.active = false;
    } else {
      this.iconElements[this.currentIconIndex].style.opacity = 0.3;
    }
  });
  }

  private positionElements(elements) {
    const iconCount = elements.length;
    this.angle = 360 / iconCount;
    this.currentPosition = 0;

    for (const e of elements) {
      e.style.transform = `rotate(-${this.currentPosition}deg) translate(65px) rotate(90deg)`;
      this.currentPosition += this.angle;
    };

    this.iconContainer.nativeElement.style.transform = 'rotate(-90deg)';
    this.currentPosition = -90;
  }

  private cycle(direction: string) {
    if (direction === 'increment') {
      this.iconContainer.nativeElement.style.transform = `rotate(${this.currentPosition + this.angle}deg)`;
      this.currentPosition += this.angle;
      this.incrementCurrentIconIndex();
    } else {
      this.iconContainer.nativeElement.style.transform = `rotate(${this.currentPosition - this.angle}deg)`;
      this.currentPosition -= this.angle;
      this.decrementCurrentIconIndex();
    }
  }

  private decrementCurrentIconIndex() {
    if (this.currentIconIndex === 0) {
      this.currentIconIndex = this.iconImages.length - 1;
    } else {
      this.currentIconIndex--;
    }
    this.currentIcon = this.iconImages[this.currentIconIndex];
  }

  private incrementCurrentIconIndex() {
    this.currentIconIndex = (this.currentIconIndex + 1) % this.iconImages.length;
    this.currentIcon = this.iconImages[this.currentIconIndex];
  }

}
