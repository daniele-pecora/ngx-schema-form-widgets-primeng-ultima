import { FormProperty } from "ngx-schema-form";

/*
 * define here the form actions
 */

export const actions = {
    'changeSize': (formProperty: FormProperty, params: any) => {
        formProperty.schema.widget.size = formProperty.schema.widget.size !== '90%' ? '90%' : ''
        console.log('changeSize', formProperty, params)
    },
    'toggleArrayType': (formProperty: FormProperty, params: any) => {
        if (!formProperty.schema.widget.style) {
            formProperty.schema.widget.style = 'tabview'
        } else if ('tabview' === formProperty.schema.widget.style) {
            formProperty.schema.widget.style = 'accordion'
        } else if ('accordion' === formProperty.schema.widget.style) {
            formProperty.schema.widget.style = ''
        }
        console.log('toggleArrayType', formProperty, params)
    }
};
