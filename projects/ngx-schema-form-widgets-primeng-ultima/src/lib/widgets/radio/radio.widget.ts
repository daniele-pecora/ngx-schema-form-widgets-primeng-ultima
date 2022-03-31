import { Component, AfterViewInit, ViewChild, Renderer2 } from '@angular/core';
import { ControlWidget } from 'ngx-schema-form'
import { NoHelperTextSpacer } from '../_component-helper/no-helpertext-spacer.widget';
import { IsFormPropertyRequiredAttributeStringPipe } from '../_pipe/IsRequiredField';


@Component({
  selector: 'ngx-ui-radio-widget',
  templateUrl: './radio.widget.html',
  styleUrls: ['./radio.widget.scss', '../_component-helper/no-helpertext-spacer.widget.scss']
})
export class RadioWidgetComponent extends NoHelperTextSpacer implements AfterViewInit {

  @ViewChild('radioButtonEl')
  radioButtonEl

  constructor(private renderer2: Renderer2) {
    super()
  }

  ngAfterViewInit() {
    super.ngAfterViewInit()
    // first element is needed only
    const input = this.radioButtonEl.inputViewChild.nativeElement // is 'input'
    const input_required = new IsFormPropertyRequiredAttributeStringPipe().transform(this.formProperty)
    if (input_required) {
      this.renderer2.setAttribute(input, 'required', input_required)
      this.renderer2.setAttribute(input, 'aria-required', 'true')
    }
  }

  createRadioId(radioValue: any) {
    return `${this.id}__${radioValue}`.replace(new RegExp('[\\s]+', 'ig'), '_')
  }
}
