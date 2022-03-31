import {Bindings} from 'ngx-schema-form-view'
import {FormProperty} from 'ngx-schema-form'

export const bindings: Bindings = {
  '/address': [{
    'change': (event?: any, formProperty?: FormProperty | any) => {
      console.log('###################::::::', 'event - change', event, 'formProperty', formProperty)
    },
    'input': (event?: any, formProperty?: FormProperty | any) => {
      console.log('###################::::::', 'event - input', event, 'formProperty', formProperty)
    }
  }]
}
