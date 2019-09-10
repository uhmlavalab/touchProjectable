import { Component, OnInit, ViewChildren, ViewChild, HostListener } from '@angular/core';
import { MapSelectionDirectiveDirective } from './map-selection-directive.directive';
import { landingButtons } from '../../assets/defaultData/landingButtons';
import { panels } from '../../assets/defaultData/landingPanels';
import { Plan, Marker, Panel, LandingButton, MapLayer } from '@app/interfaces';
import { ArService } from '../services/ar.service';
import { PlanService } from '../services/plan.service';
import { WindowRefService } from '../services/window-ref.service';
import { ProjectableMarker } from '../classes/projectableMarker';
import { _ } from 'underscore';


@Component({
  selector: 'app-landing-home',
  templateUrl: './landing-home.component.html',
  styleUrls: ['./landing-home.component.css']
})

/** This class represents the landing screen of the projectable project */
export class LandingHomeComponent implements OnInit {

  // Create an array of the children tagged with MapSelectionDirectiveDirective
  @ViewChildren(MapSelectionDirectiveDirective) slideDirective;
  @ViewChild('manualPoint', { static: false }) manualPoint;
  @ViewChild('trackingDot', { static: false }) trackingDot;

  /* Strings That determine what html elements to display */
  private help: string;                         // Determines which help menu to display
  private changingMarkerJob: string;            // Determines which job is being changed.
  private activePanel: string;                  // Determines which panel is displayed.  IE. Maps, Help, Change Markers etc.

  /* State Variables */
  private loading: boolean;                     // True if loading, false if not.           

  /* Marker Change Variables */
  private tempMarkerChange: { id: number, job: string };  // Holds the data temporarily when reassigning a marker's job and id.
  private markerIcons: { year: string, chart: string, scenario: string, layer: string, unassigned: string }; // Icons used for marker change routine.

  /* Object Data.  Some is loaded from default Data and stored in these Variables */
  private nativeWindow: any;                    // Second screen Object
  private markers: ProjectableMarker[];         // Projectable Marker array
  private panels: Panel;                        // Loaded from default Data (holds panel data)
  private plans: Plan[];                        // Array of all possible Plans
  private jobs: any[];                          // List of all possible jobs.
  private buttons: LandingButton;               // Button array used to load html elements


  /* Calibration */
  private calibrating: boolean;                 // Is the map in a calibrating state.
  private testTrack: boolean;                   // True when completing calibration and making the final adjustments on the tracking.
  private detectionWarning: boolean;            // True when user tries to store a data point and marker is not detected.
  private markerDetected: boolean;              // If marker is detected on the table during calibration, then this is true.  Otherwise false.
  private manualPosition: number;               // Identifies which location to place the dot during calibration.

  /* Data For Calibration */
  private centerX: number;                      // Top Camera X
  private centerY: number;                      // Top Camera Y
  private centerX2: number;                     // Bottom Camera X
  private centerY2: number;                     // Bottom Camera Y

  constructor(private arservice: ArService,
    private planService: PlanService,
    private windowRefservice: WindowRefService) {

    /* Initialize all State and HTML content (for *ngFor routines) */
    this.setupUIContent();

    /* Initialize All Marker Change Data (Only used in reference to reassigning jobs and ids to projectable marker pucks*/
    this.setupMarkerChangeData();


    /* Initialize All Calibration Data */
    this.setupCalibrationData();

  }

  ngOnInit() {
    this.plans = this.planService.getPlans();  // Initialize the plans.

    /** Data Subscriptions */
    this.windowRefservice.loadingSubject.subscribe({
      next: value => {
        this.loading = value;
      }
    });

    this.arservice.calibrationSubject.subscribe({
      next: value => {
        this.calibrationDetected(value);
        if (this.testTrack) {
          this.track(value);
        }
      }
    });
  }

  /******************************************************************************************
   * ************************* Initialization Subroutines ***********************************
   * The following routines are used to initialize the component
   * data and are called from the constructor. 
   * ****************************************************************************************/

  /** Initializes the data used for the reassignment of marker (jobs and id)
   */
  private setupMarkerChangeData(): void {
    this.changingMarkerJob = 'none';            // No Marker is being changed.
    this.tempMarkerChange = { id: -1, job: '' };  // Initialize the temp marker Data
    this.markerIcons = {
      year: 'layers-01.png',
      chart: 'pie-01.png',
      layer: 'layers-01.png',
      scenario: 'scenario-01.png',
      unassigned: ''
    }
    this.jobs = this.setJobsArray();            // Get the Available Jobs data
  }

  /** Initializes the jobs Array.  The jobsList is currently hardcoded here. */
  private setJobsArray(): any[] {
    const jobsList = ['year', 'layer', 'chart', 'scenario'];
    const resultsArray = [];
    jobsList.forEach(jobText => {
      const marker = ProjectableMarker.getProjectableMarkerByJob(jobText);
      const iconText = marker ? marker.icon : null;
      const id = marker ? marker.markerId : null;
      resultsArray.push({ job: jobText, icon: this.markerIcons[jobText], markerId: id });
    });
    return resultsArray;
  }

  /** Initializes the data used for calibrating the pucks */
  private setupCalibrationData(): void {
    this.calibrating = false;
    this.testTrack = false;
    this.detectionWarning = false;
    this.markerDetected = false;
    this.manualPosition = -1;
    this.centerX = 0;
    this.centerY = 0;
    this.centerX2 = 0;
    this.centerY2 = 0;
  }

  /** Initializes the data that determines what data is displayed in the UI */
  private setupUIContent(): void {
    this.buttons = landingButtons;              // Imported from Default Data
    this.panels = panels;                       // Imported from default data
    this.activePanel = 'maps';                  // Always start showing the map selection panel.                      
    this.help = 'keyboard';                     // Show keyboard shortcut controls as first help view.
    this.nativeWindow = this.windowRefservice.getNativeWindow();
    this.loading = this.windowRefservice.getLoadingStatus();  // Determines if the second screen is loading.
  }

  /*****************************************************************************************************
   * ***************************************************************************************************
   * ************************* Calibration Related Functions *******************************************
   * ***************************************************************************************************
   * ***************************************************************************************************
   */

  /** Starts the Calibration process.  This is called from the HTML button */
  private startCalibration(): void {
    this.calibrating = true; // Update State
    this.arservice.startCalibration(); // Update the state in the service
    this.manualPosition = 0; // Position 0
    this.manualCalibration(this.manualPosition); // Begin Calibration
  }

  /** The manual Calibration function determines where to place the dot on the map.  This is the dot
   * that tells the user where to place the puck during calibration.
   * @param position A number between 0 - 5.
   */
  private manualCalibration(position: number): void {
    const element = this.manualPoint.nativeElement; // Dot that tells user where to place puck for calibration
    let left = '0';
    let top = '0';

    switch (position) {
      case 0: {
        break;
      }
      case 1: {
        left = 'calc(22vw - 50px)';
        break;
      }
      case 2: {
        top = '50vh';
        break;
      }
      case 3: {
        left = 'calc(22vw - 50px)';
        top = '50vh';
        break;
      }
      case 4: {
        top = 'calc(96% - 50px)';
        break;
      }
      case 5: {
        left = 'calc(22vw - 50px)';
        top = 'calc(96% - 50px)';
        break;
      }
      default: { // When index hits 6, the function is finished
        this.calibrating = false;
        this.arservice.completeCalibration(true);
        this.testTracking(); // Begin the offset adjustment process
        break;
      }
    }
    
    /** Move the dot */
    element.style.left = left;
    element.style.top = top;
  }

  /** This ends the final adjustment process of calibration. */
  private completeTrackTesting(): void {
    this.testTrack = false; // Set State
    this.arservice.stopCalibration(); // Stop Calibrating in the service.
    this.arservice.generateFile(); // Create the new calibration File for download.
  }

  /** Tells HMTL template to display a warning */
  private displayCalibrationWarning(): void {
    this.detectionWarning = true;
    setTimeout(() => {
      this.detectionWarning = false;
    }, 2000);
  }

  /** Confirms a marker position and stores the data as a tracking point. It validates that
   * the correct data has been collected before storing anything.
  */
  private confirmPosition(): void {

    // Check to make certain the marker is detected and on the table.
    if (!this.markerDetected) {
      this.displayCalibrationWarning();
      return;
    }

    // Validate data
    if (this.arservice.getTrackingPointId() === 0 || this.arservice.getTrackingPointId() === 1) {
      if (this.centerX2 === 0 || this.centerY2 === 0) {
        alert('Top Camera did not capture any location Data.  Please try again.');
        return;
      }
    } else if (this.arservice.getTrackingPointId() === 2 || this.arservice.getTrackingPointId() === 3) {
      if (this.centerX2 === 0 || this.centerY2 === 0 || this.centerX === 0 || this.centerY === 0) {
        alert('At least one data point was not captured.  Please Try Again');
        return;
      }
    } else {
      if (this.centerX === 0 || this.centerY === 0) {
        alert('Bottom Camera did not capture any location Data.  Please Try Again.');
        return;
      }
    }

    const element = this.manualPoint.nativeElement.getBoundingClientRect();
    const mapX = (element.right + element.left) / 2;
    const mapY = (element.top + element.bottom) / 2;
    this.arservice.createTrackingPoint(this.centerX, this.centerY, this.centerX2, this.centerY2, mapX, mapY);
    this.manualPosition++;
    this.manualCalibration(this.manualPosition); // Continue to next position.
  }

  /** Calibration data is displayed at the top of the screen.  Data is passed from the subscription to the arservice.
   * @param calibrationData marker data.
   */
  private calibrationDetected(calibrationData: any): void {

    if (calibrationData.length > 0) {
      this.markerDetected = true;
      calibrationData.forEach(pm => {
        if (pm.camera === 1) {
          this.centerX = pm.marker.getCenterX(pm.corners);
          this.centerY = pm.marker.getCenterY(pm.corners);
        }

        if (pm.camera === 2) {
          this.centerX2 = pm.marker.getCenterX(pm.corners);
          this.centerY2 = pm.marker.getCenterY(pm.corners);
        }
      });
    } else {
      this.markerDetected = false;
      this.centerX = 0;
      this.centerY = 0;
      this.centerX2 = 0;
      this.centerY2 = 0;
    }
  }

  /** Begins the process of fine tuning the x and y offests.*/
  private testTracking(): void {
    this.testTrack = true;
  }

  /** Tracks the marker on the table.  Uses the same algorithm as the map-main */
  private track(data) {
    if (data != undefined) {
      try {

        ProjectableMarker.getAllProjectableMarkersArray().forEach(pm => {
          const dataPoint = _.find(data, m => m.marker.markerId === pm.markerId);
          pm.addDataPoint(dataPoint);
        });

        const dataPoint = { x: data[0].marker.getMostRecentCenterX(), y: data[0].marker.getMostRecentCenterY() };
        this.trackingDot.nativeElement.style.left = dataPoint.x + 25 + 'px';
        this.trackingDot.nativeElement.style.top = dataPoint.y + 25 + 'px';


      } catch (error) {
        //undefined marker
      }
    }
  }


  /*********************************************************************************
   *********************************************************************************
   *********************************************************************************
   ****************************** USER INFERFACE ROUTINES ***************************
   ********************************************************************************
   ********************************************************************************
   */


  /**
   * This function handles the clicks on the start buttons.  When the button is
   * clicked, the state of the application is changed from setup to run.  The Data
   * necessary to start the program correctly is passed through here.
   * @param island => Contains the island that will be used for this program.
   */
  handleStartButtonClick(plan: Plan): void {
    this.plans.forEach(el => el.selectedPlan = false);
    plan.selectedPlan = true;
    this.planService.setupSelectedPlan(plan);
    this.planService.setState('run');
    if (plan.includeSecondScreen) {
      if (this.openSecondScreen()) {
        const planLayerData = [];
        plan.map.mapLayers.forEach(layer => planLayerData.push({
          name: layer.name,
          displayName: layer.displayName,
          iconPath: layer.iconPath
        }));

        this.startSecondScreen(plan);
      }
    }
  }

  /** Start UP the Second screen */
  private startSecondScreen(plan: Plan): void {
    if (this.windowRefservice.secondScreenExists()) {
      this.windowRefservice.notifySecondScreen(JSON.stringify(
        {
          type: 'setup',
          name: plan.name,
          currentYear: this.planService.getCurrentYear(),
        }));
    } else {
      setTimeout(() => {
        this.startSecondScreen(plan);
      }, 1000);
    }
  }

  /**
   * This function handles changes to the add 2nd screen checkbox.  Updates the variable
   * In the island object.
   * @param island => The island that will be used to start the program.
   * @param isChecked => true if checked, false if unchecked.
   */
  private handleIncludeSecondScreenCheckboxChange(island: Plan, isChecked: boolean): void {
    island.includeSecondScreen = isChecked;
  }

  /**
   * This function handles the clicks on the buttons that select which element
   * of the table to configure/setup.  It identifies which child element of the
   * directive slideDirective has been clicked and moves all elements accordingly.
   * @param targetElement => The element that was clicked.
   */
  private handleSelectButtonClick(targetElement: any): void {
    this.activePanel = targetElement.id;
  }

  /**
   * This function adds and removes layers during setup when the checkbox is changed.
   * @param layer => the layer that was changed.
   * @param checked => true if checked, false if not checked.
   */
  private handleLayerSetupCheck(layer: MapLayer, checked: boolean): void {
    layer.included = checked;
  }

  /** Opens a second screen as long as there isnt one opened already.
   * @return true if scucessful, false if not opened
   */
  private openSecondScreen(): boolean {
    if (!(this.windowRefservice.secondScreenIsSet())) {
      this.windowRefservice.setSecondSceenObject(this.nativeWindow.open('second-screen', 'secondScreen'));
      return true;
    } else {
      return false;
    }
  }

  /**
   * This function is called when user clicks on one of the help navigation buttons.  It changes the
   * class of the button that was clicked to active, reverts the previous to normal and swaps the view of
   * the content container.
   * @param event => The mouseclick event.
   * @param tag => The string that identifies the button that was clicked.
   */
  private handleHelpNavClick(event: any, tag: string): void {
    this.help = tag;
  }

  /**
   * This function is called when user clicks on change a marker during setup.  The user will be shown a
   * list of active markers and they can choose from those markers and assign it to this job.
   * @param event => The click event
   * @param tag => The job that is being changed.
   */
  private handleChangeMarker(event: any, tag: string): void {
    this.changingMarkerJob = tag;
  }

  /**
   * Confirms changes made to the markers.
   * @param event => The click event
   * @param tag => The job tag
   */
  private handleConfirmMarkerChange(event: any, tag: string): void {

    const newId = this.tempMarkerChange.id;
    const newJob = this.tempMarkerChange.job;
    const markers = ProjectableMarker.getAllProjectableMarkers();

    if (ProjectableMarker.getProjectableMarkerByJob(newJob) === undefined) {
      markers[newId].setJob(newJob);
      markers[newId].setIcon(this.markerIcons[newJob]);
    } else {
      const oldMarker = ProjectableMarker.getProjectableMarkerByJob(newJob);
      const oldId = oldMarker.markerId;
      oldMarker.setJob('unassigned');
      oldMarker.setIcon(this.markerIcons['unassigned']);
      markers[newId].setJob(newJob);
      markers[newId].setIcon(this.markerIcons[newJob]);
    }
    this.changingMarkerJob = 'none';
    this.jobs = this.setJobsArray();
  }


  /** Cancels a Marker change by reverting the data to unset. */
  private handleCancelMarkerChange(): void {
    this.tempMarkerChange.id = -1;
    this.tempMarkerChange.job = '';
    this.changingMarkerJob = 'none';
  }


  /** Reassigns the marker job and id
   * @param job The new job to assign.
   * @param id the new id to assign.
   */
  private reassignMarker(job: string, id: number) {
    this.tempMarkerChange.id = id;
    this.tempMarkerChange.job = job;
  }

 

  /* KEYBOARD CONTROLS */
  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.key === 'ArrowUp') {
      this.arservice.incrementYOffset();
    } else if (event.key === 'ArrowDown') {
      this.arservice.decrementYOffset();
    } else if (event.key === 'ArrowLeft') {
      this.arservice.incrementXOffset();
    } else if (event.key === 'ArrowRight') {
      this.arservice.decrementXOffset();
    } else if (event.key === 'w') {
      this.arservice.incrementYOffset2();
    } else if (event.key === 's') {
      this.arservice.decrementYOffset2();
    } else if (event.key === 'a') {
      this.arservice.incrementXOffset2();
    } else if (event.key === 'd') {
      this.arservice.decrementXOffset2();
    }
  }
}