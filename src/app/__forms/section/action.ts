import {FormProperty} from "ngx-schema-form";

export const actions = {
  'switch_tabview_accordion': (property: FormProperty) => {
    // the argument property is already <code>(property.findRoot() as PropertyGroup).getProperty('mainContainer')</code>
    property.schema.widget.style = property.schema.widget.style === 'tabview' ? 'accordion' : 'tabview'
    console.log(property)
    console.log('property.schema.widget.style:::', property.schema.widget.style)
  },
}
