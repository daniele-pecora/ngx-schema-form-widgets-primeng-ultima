import { FormProperty } from "ngx-schema-form";

export const actions = {
  'show_hide_dialog': (property: FormProperty) => {
    const dialog: FormProperty = property.searchProperty('/myDialog')
    if(!dialog.visible){
      alert('You must enable the dialog by typing the word "dialog" first')
    }
    dialog.schema.widget.show = !dialog.schema.widget.show
  },
  'show_hide_dialog_complex': (property: FormProperty) => {
    const dialog: FormProperty = property.searchProperty('/myDialogComplex')
    dialog.schema.widget.show = !dialog.schema.widget.show
  },
  'inside_dialog_close_dialog': (property: FormProperty) => {
    const dialog: FormProperty = property.searchProperty('/myDialogComplex')
    dialog.schema.widget.show = false
  },
  'inside_dialog_clear_form': (property: FormProperty) => {
    property.root.reset(null, false)
    const dialog: FormProperty = property.searchProperty('/myDialogComplex')
    dialog.schema.widget.show = false
  }
}
