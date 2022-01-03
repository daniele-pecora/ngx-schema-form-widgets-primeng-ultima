/*
 * define here the form actions
 */

import {FormProperty} from "ngx-schema-form";

export const actions = {
  "wizard_action_prev": (property, params) => {
  },
  "wizard_action_next": (property, params) => {
  },
  "wizard_action_finish": (property, params) => {
    actions['onModelChangeFinal'].emit(property)
  },
  "action_toggle_view": (property: FormProperty, parameters: any) => {
    property.schema.widget.style = property.schema.widget.style !== 'accordion' ? 'accordion' : 'default'
  }
};
