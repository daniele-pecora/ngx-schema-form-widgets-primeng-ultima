/**
 * Created by daniele on 11.07.17.
 */
import {Component} from "@angular/core";
import {ControlWidget} from "ngx-schema-form";
import { NoHelperTextSpacer } from "../_component-helper/no-helpertext-spacer.widget";

@Component({
  selector: 'ngx-ui-checkbox-widget',
  templateUrl: './checkbox.widget.html',
  styleUrls: ['../_component-helper/no-helpertext-spacer.widget.scss']
})
export class CheckboxWidgetComponent extends NoHelperTextSpacer {
}
