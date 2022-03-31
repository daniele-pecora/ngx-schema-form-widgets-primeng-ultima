/**
 * Created by daniele on 05.07.17.
 */
import { Component, AfterViewInit, Renderer2, ViewChild } from '@angular/core';

import { ControlWidget } from 'ngx-schema-form';
import { NoHelperTextSpacer } from '../_component-helper/no-helpertext-spacer.widget';
import { IsFormPropertyRequiredAttributeStringPipe } from '../_pipe/IsRequiredField';

@Component({
  selector: 'ngx-ui-switch-widget',
  templateUrl: './switch.widget.html',
  styleUrls: ['./switch.widget.scss', '../_component-helper/no-helpertext-spacer.widget.scss']
})
export class SwitchWidgetComponent extends NoHelperTextSpacer implements AfterViewInit {
  @ViewChild('inputSwitchEl')
  inputSwitchEl

  constructor(private renderer2: Renderer2) {
    super()
  }

  ngAfterViewInit() {
    super.ngAfterViewInit()
    // first element is needed only
    const nativeElement = this.inputSwitchEl.cd.rootNodes[0] || this.inputSwitchEl.cd._lView[0]
    const input = nativeElement.querySelector('input[type=checkbox]') // find hidded aria element
    const input_required = new IsFormPropertyRequiredAttributeStringPipe().transform(this.formProperty)
    if (input_required) {
      this.renderer2.setAttribute(input, 'required', input_required)
      this.renderer2.setAttribute(input, 'aria-required', 'true')
    }
  }

  handleChange(event){

  }
}
