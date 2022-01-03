import {Component, OnDestroy, OnInit} from '@angular/core'
import {RippleHelper} from './RippleHelper'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [RippleHelper]
})
export class AppComponent implements OnInit, OnDestroy {
  layoutModeCompact = false;

  constructor(private rippleHelper: RippleHelper) {

  }

  ngOnInit(): void {
    this.rippleHelper.start()
  }

  ngOnDestroy(): void {
    if (this.rippleHelper) {
      this.rippleHelper.destroy()
    }
  }
}
