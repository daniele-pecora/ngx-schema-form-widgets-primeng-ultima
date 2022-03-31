import { ButtonTypeTransformerService } from './button-type-transformer.service'
import { Injectable } from "@angular/core";

/**
 * Converts button types to PrimeNG button style css class<br/>
 */
@Injectable()
export class ButtonTypeTransformerPrimengUltimaService extends ButtonTypeTransformerService {
  types = {
    'mini-fab': 'ui-button-icon-only ngx-ui-widget-button-accent ngx-ui-widget-button-mini-fab',
    'fab': 'ui-button-icon-only ngx-ui-widget-button-accent ngx-ui-widget-button-fab',
    'raised': '',
    'flat': 'flat',
    '': ''
  }
  transform(value: string): string {
    return this.types[value || '']
  }
}
