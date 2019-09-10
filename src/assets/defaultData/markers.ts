import { Marker } from '@app/interfaces';
import { PlanService } from '../../app/services/plan.service'

export const markers: Marker[] = [{
  markerId: 320,
  //markerId: 1,
  secondId: 3,
  job: 'year',
  delay: 75, 
  minRotation: 4,
  rotateLeft(planService: PlanService) {
   planService.decrementCurrentYear();
  },
  rotateRight(planService: PlanService) {
    planService.incrementCurrentYear();
  }
}, {
  markerId: 7,
  secondId: 6,
  job: 'layer',
  delay: 300, 
  minRotation: 4,
  rotateLeft(planService: PlanService) {
    planService.decrementNextLayer();
   },
   rotateRight(planService: PlanService) {
    planService.incrementNextLayer();
   }
}, {
  markerId: 9,
  secondId: 5,
  job: 'scenario',
  delay: 300, 
  minRotation: 4,
  rotateLeft(planService: PlanService) {
    this.planService.decrementScenario();
   },
   rotateRight(planService: PlanService) {
    this.planService.incrementScenario();
   }
}, {
  markerId: 11,
  secondId: 7,
  job: 'add',
  delay: 300, 
  minRotation: 4,
  rotateLeft(planService: PlanService) {
    planService.toggleLayer();
   },
   rotateRight(planService: PlanService) {
    planService.toggleLayer();
   }
}];
