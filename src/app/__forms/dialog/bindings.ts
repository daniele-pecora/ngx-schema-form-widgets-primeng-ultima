import { Bindings } from 'ngx-schema-form-view'
import { FormProperty } from 'ngx-schema-form'

export const bindings: Bindings = {
  '/dialogTriggerInput/testOnClick': [{
    'click': (event?: any, formProperty?: FormProperty | any) => {
      const dialog: FormProperty = formProperty.searchProperty('/myDialogClick')
      dialog.schema.widget.show = true
    }
  }]
}
