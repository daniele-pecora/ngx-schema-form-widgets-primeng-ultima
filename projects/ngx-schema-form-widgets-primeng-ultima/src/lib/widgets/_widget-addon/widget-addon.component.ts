import {Component, Input} from '@angular/core'

@Component({
  selector: 'ngx-ui-widget-addon',
  template: `
    <!--
          Render-Component of <code>prefix</code> and <code>suffix</code> of element 'widget':
            
            Expects an array of 
            [{
              icon:string        = the icon name to set, may also contain the icon-set class. eg. "vi vi-pen"
              text:string        = the text to set 
              ligature:boolean   = set if the icon name is a ligature name so it will be set as HTML content of the <i> tag
                                   ligature is supported only for "material-icons"
                                   to keep backward-compatibility default is true
             }]
    -->
    <span [attr.tabindex]="-1" [attr.aria-hidden]="true" *ngFor="let addon of addons" class="ui-inputgroup-addon">
        <i [attr.tabindex]="-1" [attr.aria-hidden]="true" *ngIf="(addon.icon && !addon.ligature); else ligatureIcon" class="{{addon.icon}}"></i>
        <ng-template #ligatureIcon>
          <i [attr.tabindex]="-1" [attr.aria-hidden]="true" *ngIf="addon.icon" class="material-icons">{{addon.icon}}</i>
        </ng-template>
        <span [attr.tabindex]="-1" [attr.aria-hidden]="true" *ngIf="addon.text">{{addon.text}}</span>
      </span>
  `
})
export class WidgetAddonComponent {
  @Input()
  addons: {
    icon?: string
    text?: string
    ligature?: boolean
  }[]
}
