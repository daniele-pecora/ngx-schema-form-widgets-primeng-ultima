import {Bindings} from 'ngx-schema-form-view'
import {FormProperty} from 'ngx-schema-form'

export const bindings: Bindings = {
  '/antragsteller/land': [{
    'change': (event?: any, formProperty?: FormProperty | any) => {
      console.log('###################::::::', 'event', event, 'formProperty', formProperty)
    },
    'input': (event?: any, formProperty?: FormProperty | any) => {
      console.log('###################::::::', 'event', event, 'formProperty', formProperty)
    }
  }]
}
