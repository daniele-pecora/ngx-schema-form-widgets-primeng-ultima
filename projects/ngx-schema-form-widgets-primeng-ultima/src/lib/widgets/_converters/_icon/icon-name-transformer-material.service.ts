import {IconNameTransformerService} from './icon-name-transformer.service'

/**
 * Converts Material Design Icon names to PrimeNG Icon names by adding the prefix <code>ui-icon-</code>.<br/>
 * Skips any icon that starts with the VOIS icon prefix <code>vi-</code>.
 */
export class IconNameTransformerMaterialService extends IconNameTransformerService {

    transform(value: string): string {
        if (value && !value.startsWith('vi-') && -1 !== value.indexOf('ui-icon-')) {
            return value.replace('ui-icon-', '').replace(new RegExp('-','g'), '_')
        }
        return value
    }

}