import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ArService } from '../services/ar.service';
import { PlanService } from '../services/plan.service';

@Component({
  selector: 'app-video-feed',
  templateUrl: './video-feed.component.html',
  styleUrls: ['./video-feed.component.css']
})
export class VideoFeedComponent implements OnInit {
  @ViewChild('videoElement', { static: true }) videoElement: any;
  @ViewChild('videoElement1', { static: true }) videoElement1: any;
  @ViewChild('videoCanvas1', { static: true }) videoCanvas1: any;
  @ViewChild('videoCanvas2', { static: true }) videoCanvas2: any;

  private devices: any[] = [];
  private videoArray: any[] = [];
  private canvasWidth: number;
  private canvasHeight: number;
  private mapState: string;

  private static numberOfFeeds: number = 0;
  private static MAX_FEEDS: number = 2;

  constructor(private _arservice: ArService, private planService: PlanService) {
    this.canvasHeight = 400;
    this.canvasWidth = 400;
    this.mapState = this.planService.getState();
  }

  ngOnInit() {
    this.videoCanvas1.nativeElement.width = this.canvasWidth;
    this.videoCanvas1.nativeElement.height = this.canvasHeight;
    this.videoCanvas2.nativeElement.width = this.canvasWidth;
    this.videoCanvas2.nativeElement.height = this.canvasHeight;

    /* Video Data */
    this.videoArray = [
      {
        id: 1,
        video: this.videoElement.nativeElement,
        canvas: {
          element: this.videoCanvas1.nativeElement,
          width: this.canvasWidth,
          height: this.canvasHeight,
          ctx: this.videoCanvas1.nativeElement.getContext("2d")
        },
      },
      {
        id: 2,
        video: this.videoElement1.nativeElement,
        canvas: {
          element: this.videoCanvas2.nativeElement,
          width: this.canvasWidth,
          height: this.canvasHeight,
          ctx: this.videoCanvas2.nativeElement.getContext("2d")
        },
      }];

    /* Set Up the Video Feeds */
    navigator.mediaDevices.enumerateDevices().then(this.getDevices)
      .then(feeds => {
        feeds.forEach(feed => {
          if (VideoFeedComponent.numberOfFeeds < VideoFeedComponent.MAX_FEEDS) {
            this.initCamera(feed, this.videoArray[VideoFeedComponent.numberOfFeeds++].video);
          }
        })
      })
      .then(this._arservice.runApplication(this.videoArray));
  }

  /* When Closed, clear all video feeds so they can be reopened fresh */
  ngOnDestroy() {
    this.videoArray.forEach( videoElement => {
      // videoElement.video.pause();
      // videoElement.video.srcObject = null;
      // videoElement.video.load();
      videoElement = null;
    });
    VideoFeedComponent.numberOfFeeds = 0; // Reset feed Counter
  }

  private handleVideoError(error) {
    console.log('Missing Video Feed');
  }

  /** Initializes the camera
  * @param feed => The id of the video feed to connect to the video element
  * @param vid => The html video element
  * @return true when completed.
  */
  private initCamera(feed, vid): boolean {
    navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: { exact: feed }
      }
    }).then(stream => {
      vid.srcObject = stream;
      vid.play();
    }).catch(this.handleVideoError);
    return true;
  }

  /** This function detects the videoinput elements connected to the
  * machine.
  * @param devices => a list of all devices;
  * @return an array of only videoinput devices.
  */
  private getDevices(devices): any[] {
    const videoFeeds: any[] = [];
    devices.forEach(device => {
      if (device.kind === 'videoinput') {
        videoFeeds.push(device.deviceId);
      }
    });
    return videoFeeds;
  }


}
