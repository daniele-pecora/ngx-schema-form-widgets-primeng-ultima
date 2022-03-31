/**
 * Created by daniele on 04.07.17.
 */
import {Component} from '@angular/core';
import {ControlWidget} from 'ngx-schema-form';
import { NoHelperTextSpacer } from '../_component-helper/no-helpertext-spacer.widget';

@Component({
  selector: 'ngx-ui-string-widget',
  templateUrl: './string.widget.html',
  styleUrls: ['../_component-helper/no-helpertext-spacer.widget.scss']
})
export class StringWidgetComponent extends NoHelperTextSpacer {

  getInputType() {
    if (!this.schema.widget.id || this.schema.widget.id === 'string') {
      return 'text';
    } else if (this.schema.widget.id === 'date-native'){
      return 'date'
    } else {
      return this.schema.widget.id;
    }
  }

  getKeyFilter(): string | RegExp {
    return this.parseKeyFilter(((this.schema || {}).widget || {}).keyFilter);
  }

  parseKeyFilter(keyfilter: string): string | RegExp {
    if (keyfilter) {
      keyfilter = keyfilter.trim();
      if (keyfilter.startsWith('/')) {
        const startIx = keyfilter.indexOf('/');
        let endIx = keyfilter.lastIndexOf('/');
        if (-1 !== startIx && -1 !== (endIx = keyfilter.lastIndexOf('/'))) {
          const regex = keyfilter.substring(startIx + 1, endIx);
          const suffix = keyfilter.substring(endIx + 1, keyfilter.length);
          const prefix = keyfilter.substring(0, startIx);
          return new RegExp(regex, suffix);
        }
      }
    }
    return keyfilter || '';
  }
}
