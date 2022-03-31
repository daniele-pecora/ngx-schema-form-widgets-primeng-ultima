import {IconNameTransformerService} from './icon-name-transformer.service'
import { Injectable } from "@angular/core";

/**
 * Converts PrimeNG Icon names to Material Design Icon names by removing the prefix <code>ui-icon-</code>.<br/>
 * Skips any icon that starts with the VOIS icon prefix <code>vi-</code>.
 */
@Injectable()
export class IconNameTransformerPrimengUltimaService extends IconNameTransformerService {

    transform(value: string): string {
        if (value && !value.startsWith('vi-') && -1 === value.indexOf('ui-icon-')) {
            return 'ui-icon-' + value.replace(new RegExp('_', 'g'), '-')
        }
        return value
    }

}