import { Component, Input, OnInit } from '@angular/core'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'
import { Dialog } from "primeng/dialog";
import { isMobileDevice } from '../_utils/utils'

export interface WidgetLinkComponentModel {
    id: string
    target: string
    description: string
    href: string
    label: string
    icon: string
    iconPos: string
    /**
     * Show content in an overlay iframe
     */
    overlay: boolean
    overlayClose: string
    overlayOpen: string
    sandbox: string
}

@Component({
    selector: 'ngx-ui-widget-link',
    styleUrls: ['./widget-link.component.scss'],
    templateUrl: './widget-link.component.html'
})
export class WidgetLinkComponent implements OnInit {

    @Input()
    link: WidgetLinkComponentModel

    @Input()
    /**
     * will decide to render the <code>href</code> attribute or not
     */
    disabled: boolean

    safeURL: SafeResourceUrl

    get href() {
        return !this.disabled && this.link.href ? this.safeURL : null
    }

    mobileDevice: boolean

    constructor(private domSanitizer: DomSanitizer) {
        this.mobileDevice = isMobileDevice()
    }

    private safeResourceUrl(href: string): SafeResourceUrl {
        return this.domSanitizer.bypassSecurityTrustResourceUrl(href)
    }

    ngOnInit(): void {
        /**
         * the safe-resource-url must be pre-rendered otherwise
         * the iframe re-loads periodically due to the change detection
         */
        if (this.link.href) {
            this.safeURL = this.safeResourceUrl(this.link.href)
        }
    }

    onClick(event) {
        if (this.link.overlay) {
            const dialogRef = event as Dialog
            dialogRef.visible = true
            // disabled____Update600_dialogRef.show()
            return false
        }
    }

    onHide(event, overlayDialog: Dialog) {
        overlayDialog.visible = false
    }

}