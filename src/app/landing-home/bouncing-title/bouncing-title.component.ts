import { Component, OnInit } from '@angular/core';
import { Tile } from './tile';

@Component({
  selector: 'app-bouncing-title',
  templateUrl: './bouncing-title.component.html',
  styleUrls: ['./bouncing-title.component.css']
})

export class BouncingTitleComponent implements OnInit {

  tileArray: Tile[];

  constructor() {
  }

  // Index of the letters.  Starts at -1 which means all letters are normal.
  bounceId = -1;

  // Styles for the title letters
  normal = 'normal-style';
  active = 'bounce-style';

  // Array of letters for the title
  titleArray = [
    { text: 'p', id: 0 },
    { text: 'r', id: 1 },
    { text: 'o', id: 2 },
    { text: 'j', id: 3 },
    { text: 'e', id: 4 },
    { text: 'c', id: 5 },
    { text: 'T', id: 6 },
    { text: 'A', id: 7 },
    { text: 'B', id: 8 },
    { text: 'L', id: 9 },
    { text: 'E', id: 10 },
  ];

  ngOnInit() {

    // Call Bounce Animation once, then repea at an interval.
    this.bounce(-1);
    setInterval(() => { this.bounce(-1); }, 8000);
  }

  /**
  * This function cycles through the letters of the title changing their
  * font size to create a simple animation.
  * @param index => The index of the letter that is set to active
  * @return => None
  */
  bounce(index): void {
    if (index >= this.titleArray.length) {
      this.bounceId = -1;
      return;
    } else {
      this.bounceId = index;
      index++;
      setTimeout(() => { this.bounce(index); }, 75);
    }
  }


}
