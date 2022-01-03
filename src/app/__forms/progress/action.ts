import { FormProperty } from "ngx-schema-form";

export const actions = {
    'action_toggle_progress_style': (property: FormProperty, parameters: any) => {
        const currStyle = property.schema.widget.style || 'spinner'
        const nextStyle = property.schema.widget.style !== 'bar' ? 'bar' : 'spinner'
        property.schema.widget.style = nextStyle
        for (const button of property.schema.buttons) {
            if (button.id === 'action_toggle_progress_style') {
                button.icon = parameters.icons[currStyle]
                break
            }
        }
    }
}
