import {Component} from "@angular/core"
import {IconNameConverterPipe} from '../_converters/_icon/IconNames'
import {ButtonWidget} from "ngx-schema-form"
import {SeverityNameConverterPipe} from '../_converters/_severity/SeverityNames'
import {clickableDisabledState, clickableVisibilityState} from './button.utils'
import { ButtonTypeTransformerService } from "../_converters/_button/button-type-transformer.service";

@Component({
  selector: 'ngx-ui-button-widget',
  templateUrl: './button.widget.html',
  styleUrls: ['./button.widget.scss'],
  providers: [IconNameConverterPipe, SeverityNameConverterPipe],
  host: {
    '[class.buttonMargin]': 'isNotInline()',
    '[class.reduceSpace]': 'isReduceSpace()',
  }
})
export class ButtonWidgetComponent extends ButtonWidget {

  constructor(private iconNameConverter?: IconNameConverterPipe
    , private severityNameConverter?: SeverityNameConverterPipe
    , private buttonTypesConverter?: ButtonTypeTransformerService
    ) {
    super()
  }

  getSeverity(value: string) {
    if (this.severityNameConverter && value) {
      return this.severityNameConverter.transform(value)
    }
    return value
  }

  getIcon(value: string) {
    if (this.iconNameConverter && value) {
      return this.iconNameConverter.transform(value)
    }
    return value
  }

  getButtonType() {
    const button = this.button ||{}
    if (!button['type'] && !button['label'] && button['icon']) {
      return 'ui-button-icon-only'
    }
    return this.buttonTypesConverter.transform(button['type'])
  }

  isClickableDisabled(objDisabled, validity, value): boolean {
    return clickableDisabledState(objDisabled, validity, value)
  }

  isButtonVisibile(objDisabled, validity, value) {
    return clickableVisibilityState(objDisabled, validity, value)
  }

  isNotInline() {
    const button = this.button || {}
    if (button.position && button.position.h === 'right') {
      return false
    }
    return true
  }
  isReduceSpace() {
    const button = this.button || {}
    return (button.position && (button.position.v === 'middle' ||  button.position.v === 'top'))
  }
}
