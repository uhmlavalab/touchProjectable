import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

/** Contains all sound related functions */
export class SoundsService {

  private clicksound: any;
  private ticksound: any;
  private waterdropUp: any;
  private waterdropDown: any;

  constructor() {
    this.clicksound = new Audio();
    this.clicksound.src = '../assets/sounds/click3.mp3';
    this.clicksound.load();

    this.ticksound = new Audio();
    this.ticksound.src = '../assets/sounds/tick.mp3';
    this.ticksound.load();

    this.waterdropUp = new Audio();
    this.waterdropUp.src = '../assets/sounds/water-high.mp3';
    this.waterdropUp.load();

    this.waterdropDown = new Audio();
    this.waterdropDown.src = '../assets/sounds/water-low.mp3';
    this.waterdropDown.load();

  }

  /** Plays a click sound */
  public click() {
    this.clicksound.play();
  }

  /** Plays a tick sound */
  public tick() {
    this.ticksound.play();
  }
  /** Plays a water droplet sound */
  public dropDown() {
    this.waterdropDown.play();
  }
  /** Plays a water droplet sound */
  public dropUp() {
    this.waterdropUp.play();
  }
}
