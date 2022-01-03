import { Injectable, NgZone } from "@angular/core"
import { DomHandler } from "primeng/dom"

// this may be removed in future when primeng fixes it
@Injectable()
export class DialogHelper {

    constructor(private ngZone: NgZone) {
    }

    public focus(dialogContentNativeElement: HTMLElement, skipButton?: boolean) {
        if (!dialogContentNativeElement)
            return

        if (!skipButton) {
            const focusable = // find a tab visible button
                DomHandler.findSingle(dialogContentNativeElement, 'button:not([tabindex="-1"])')
                // or any available button
                || DomHandler.findSingle(dialogContentNativeElement, 'button')

            if (focusable) { // set focus, just like primeng-9.0.2 does
                this.ngZone.runOutsideAngular(() => {
                    setTimeout(() => focusable.focus(), 5)
                })
            }
        }
        /**
         * Now search if an input or any other focusable element should be focussed instead.
         */
        const setFocusOnInput = true
        if (setFocusOnInput) {
            // First search for focusable Elements 
            // this may be input, textarea or button that are visible, have a tabindex > -1 and are focusable
            let focusableElements = (DomHandler.getFocusableElements(dialogContentNativeElement) || [])
            const skipThis = ['BUTTON', 'A']
            let nonButtonNonAnchor = focusableElements.filter(item => -1 == skipThis.indexOf(item.tagName)) || []
            if (nonButtonNonAnchor.length && nonButtonNonAnchor[0]) {
                // focus first focusable element
                this.ngZone.runOutsideAngular(() => {
                    setTimeout(() => nonButtonNonAnchor[0].focus(), 5)
                })
            } else if (focusableElements.length && focusableElements[0]) {
                // focus first focusable element
                this.ngZone.runOutsideAngular(() => {
                    setTimeout(() => focusableElements[0].focus(), 5)
                })
            }
        }
    }
}