import { FormProperty } from "ngx-schema-form";
const getValue = (target: any, path: string) => {
  if (target && target.ownerDocument) {
    const v = target.ownerDocument.querySelector('#' + (path || '').replace('/', ''))
    if (v) {
      return v.value
    }
  }
  return null
}
const doLogEntry = (event: any, formProperty?: FormProperty) => {
  return {
    path: formProperty.path,
    value: formProperty.value,
    inputValue: getValue(event.target, formProperty.path),
    target: event.target,
    event: event,
    formProperty: formProperty
  }
}
export const bindings = {
  '/radio': [{
    /** 
     * date format auto complete :
     * when typing the date separator character are added automatically
     */
    'change': function (event: any, formProperty?: FormProperty) {
      console.log('### change event target value: ', doLogEntry(event, formProperty))

    },
    'click': function (event: any, formProperty?: FormProperty) {
      console.log('### click event target value: ', doLogEntry(event, formProperty))

    },
    'input': function (event: any, formProperty?: FormProperty) {
      console.log('### input event target value: ', doLogEntry(event, formProperty))
    }
  }],
  '/checkbox': [{
    /** 
     * date format auto complete :
     * when typing the date separator character are added automatically
     */
    'change': function (event: any, formProperty?: FormProperty) {
      console.log('### change event target value: ', doLogEntry(event, formProperty))

    },
    'click': function (event: any, formProperty?: FormProperty) {
      console.log('### click event target value: ', doLogEntry(event, formProperty))

    },
    'input': function (event: any, formProperty?: FormProperty) {
      console.log('### input event target value: ', doLogEntry(event, formProperty))
    }
  }],
  '/switch': [{
    /** 
     * date format auto complete :
     * when typing the date separator character are added automatically
     */
    'change': function (event: any, formProperty?: FormProperty) {
      console.log('### change event target value: ', doLogEntry(event, formProperty))

    },
    'click': function (event: any, formProperty?: FormProperty) {
      console.log('### click event target value: ', doLogEntry(event, formProperty))

    },
    'input': function (event: any, formProperty?: FormProperty) {
      console.log('### input event target value: ', doLogEntry(event, formProperty))
    }
  }]
}