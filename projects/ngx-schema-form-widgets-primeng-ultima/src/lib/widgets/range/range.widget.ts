import {Component, ElementRef, Renderer2, ViewEncapsulation, ViewChild} from '@angular/core'
import {ControlWidget} from 'ngx-schema-form'
import { NoHelperTextSpacer } from '../_component-helper/no-helpertext-spacer.widget'


@Component({
  selector: 'ngx-ui-range-widget',
  templateUrl: './range.widget.html',
  styleUrls: ['./range.widget.scss', '../_component-helper/no-helpertext-spacer.widget.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RangeWidgetComponent extends NoHelperTextSpacer {
  currentValue: number
  currentValueRight: number
  offsetHorizontal: number = 0
  offsetHorizontalRight: number = 0
  showValue: boolean = false
  showValueRight: boolean = false
  constructor(private element: ElementRef, private renderer: Renderer2) {
    super()
  }
  ngAfterViewInit() {
    this.initStyles()
  }
  handleChange(e) {
    if(this.schema.widget.range) {
      this.handleChangeMultiple(e)
    } else {
      this.handleChangeSingle(e)
    }
  }

  slideEnded(e) {
    this.showValue = false
    if(this.schema.widget.range) {
      this.showValueRight = false
    }
  }

  initStyles() {
    let elements = this.element.nativeElement.querySelectorAll('.ui-slider-handle')
    elements[0].onmouseenter = () => {
      this.showValue = true
    }
    elements[0].onmouseleave = () => {
      this.showValue = false
    }
    elements[0].ontouchstart = () => {
      this.showValue = true
    }
    elements[0].ontouchend = () => {
      this.showValue = false
    }
    if(this.schema.widget.range) {
      elements[1].onmouseenter = () => {
        this.showValueRight = true
      }
      elements[1].onmouseleave = () => {
        this.showValueRight = false
      }
      elements[1].ontouchstart = () => {
        this.showValueRight = true
      }
      elements[1].ontouchend = () => {
        this.showValueRight = false
      }
      if(this.schema.widget.orientation === 'vertical') {
        elements[1].onmouseenter = () => {
          this.showValue = true
        }
        elements[1].onmouseleave = () => {
          this.showValue = false
        }
        elements[1].ontouchstart = () => {
          this.showValue = true
        }
        elements[1].ontouchend = () => {
          this.showValue = false
        }
      }
      /**
       * Fixes handle not moving when in range mode. The first handle is initially set
       * to active (higher z-index) and moving it to the right is not possible, since
       * the second slider prevents the first one to be positioned after it.
       */
      this.renderer.addClass(elements[1], 'ui-slider-handle-active')
      this.renderer.removeClass(elements[0], 'ui-slider-handle-active')
      /**
       * Somehow when using vertical, ranged slider the slider handles get a left: auto style attached.
       * This removes the style.
       */
      if(this.schema.widget.orientation === 'vertical' && this.schema.widget.range) {
        this.renderer.removeStyle(elements[0], 'left')
        this.renderer.removeStyle(elements[1], 'left')
      }
    }
  }

  handleChangeSingle(e) {
    if(!this.showValue) {
      this.showValue = true
    }
    this.currentValue = e.value >= 1000 ? Math.round(e.value / 1000) + 'k' : e.value
    if(!this.schema.widget.orientation || (this.schema.widget.orientation && this.schema.widget.orientation === 'horizontal')) {
        this.offsetHorizontal = ((e.value/(this.schema.maximum||100))*100)
    }
  }

  handleChangeMultiple(e) {
    if(!this.showValue) {
      this.showValue = true
    }
    if(!this.showValueRight) {
      this.showValueRight = true
    }
    this.currentValue = e.values[0] >= 1000 ? Math.round(e.values[0] / 1000) + 'k' : e.values[0]
    this.currentValueRight = e.values[1] >= 1000 ? Math.round(e.values[1] / 1000) + 'k' : e.values[1]
    if(!this.schema.widget.orientation || (this.schema.widget.orientation && this.schema.widget.orientation === 'horizontal')) {
        this.offsetHorizontal = ((e.values[0]/(this.schema.maximum||100))*100)
        this.offsetHorizontalRight = ((e.values[1]/(this.schema.maximum||100))*100)
    }
  }
}
