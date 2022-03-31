import { Injectable, NgZone, Renderer2 , Inject} from '@angular/core'
import { DOCUMENT } from '@angular/common'

/**
 * PrimeNG ULTIMA requires to implement the ripple effect via this utils class.<br/>
 * An implementation can be done globally in you <code>app.component.ts</code> and would look like:
 * <code>
 import {Component, OnDestroy, OnInit} from "@angular/core"
 import {RippleHelper} from './RippleHelper'

 @Component({
      selector: 'app-root',
      templateUrl: './app.component.html',
      styleUrls: ['./app.component.scss'],
      providers: [RippleHelper]
    })
 export class AppComponent implements OnInit, OnDestroy {

    constructor(private rippleHelper: RippleHelper) {

    }

    ngOnInit(): void {
      this.rippleHelper.start()
    }

    ngOnDestroy(): void {
      if (this.rippleHelper)
        this.rippleHelper.destroy()
    }
  }
 * </code>
 * The ripple effect will be added on any element having the css classes `ui-button` or `ripplelink`.<br/>
 * <br/>
 * Example <br/>
 * <code>
 <div class="ripplelink card card-with-title">
 <h3>My Title</h3>
 <div>My Content</div>
 </div>
 * </code>
 * @author Daniele Pecora, daniele.pecora@hsh-berlin.com
 */
@Injectable()
export class RippleHelper {
  rippleInitListener: any
  rippleInitListenerFn: () => void
  rippleMouseDownListener: any
  rippleMouseDownListenerFn: () => void

  window:any

  constructor(private renderer: Renderer2, private zone: NgZone
    , @Inject(DOCUMENT) private document) {
      this.window = this.document.defaultView
  }

  public start() {
    this.zone.runOutsideAngular(() => {
      this.bindRipple();
    });
  }

  bindRipple() {
    this.rippleInitListener = this.init.bind(this)
    this.rippleInitListenerFn = this.renderer.listen('document', 'DOMContentLoaded', this.rippleInitListener)
  }

  init() {
    this.rippleMouseDownListener = this.rippleMouseDown.bind(this)
    this.rippleMouseDownListenerFn = this.renderer.listen('document', 'mousedown', this.rippleMouseDownListener)
  }

  rippleMouseDown(e) {
    for (let target = e.target; target && target !== this; target = target['parentNode']) {
      if (!this.isVisible(target)) {
        continue;
      }

      // Element.matches() -> https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
      if (this.selectorMatches(target, '.ripplelink, .ui-button')) {
        const element = target
        this.rippleEffect(element, e)
        break;
      }
    }
  }

  selectorMatches(el, selector) {
    const p = Element.prototype;
    const f = p['matches'] || p['webkitMatchesSelector'] || p['mozMatchesSelector'] || p['msMatchesSelector'] || function (s) {
      return [].indexOf.call(this.document.querySelectorAll(s), this) !== -1
    };
    return f.call(el, selector);
  }

  isVisible(el) {
    return !!(el.offsetWidth || el.offsetHeight);
  }

  rippleEffect(element, e) {
    if (element.querySelector('.ink') === null) {
      const inkEl = this.renderer.createElement('span')
      this.addClass(inkEl, 'ink')

      if (this.hasClass(element, 'ripplelink')) {
        const child = element.querySelector('span,div')
        if (child) {
          child.insertAdjacentHTML('afterend', '<span class=\'ink\'></span>')
        } else {
          element.appendChild(inkEl)
        }
      } else {
        element.appendChild(inkEl)
      }
    }

    const ink = element.querySelector('.ink')
    this.removeClass(ink, 'ripple-animate')

    if (!ink.offsetHeight && !ink.offsetWidth) {
      const d = Math.max(element.offsetWidth, element.offsetHeight)
      ink.style.height = d + 'px'
      ink.style.width = d + 'px'
    }

    const x = e.pageX - this.getOffset(element).left - (ink.offsetWidth / 2)
    const y = e.pageY - this.getOffset(element).top - (ink.offsetHeight / 2)

    ink.style.top = y + 'px'
    ink.style.left = x + 'px'
    ink.style.pointerEvents = 'none'
    this.addClass(ink, 'ripple-animate')
  }

  hasClass(element, className) {
    if (element.classList) {
      return element.classList.contains(className)
    } else {
      return new RegExp('(^| )' + className + '( |$)', 'gi').test(element.className)
    }
  }

  addClass(element, className) {
    if (element.classList) {
      element.classList.add(className)
    } else {
      element.className += ' ' + className
    }
  }

  removeClass(element, className) {
    if (element.classList) {
      element.classList.remove(className)
    } else {
      element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ')
    }
  }

  getOffset(el) {
    const rect = el.getBoundingClientRect()

    return {
      top: rect.top + (this.window.pageYOffset || this.document.documentElement.scrollTop || this.document.body.scrollTop || 0),
      left: rect.left + (this.window.pageXOffset || this.document.documentElement.scrollLeft || this.document.body.scrollLeft || 0),
    }
  }

  unbindRipple() {
    if (this.rippleInitListenerFn) {
      this.rippleInitListenerFn()
    }
    if (this.rippleMouseDownListenerFn) {
      this.rippleMouseDownListenerFn()
    }
  }

  public destroy() {
    this.unbindRipple()
  }
}
