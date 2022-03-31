import { ObjectUtils } from 'primeng/utils'
// adapted from primeng autocomplete onInputChange
export class PrimeNgOverrides_OnInputChange {
    forceSelection: any
    suggestions: any
    field: any
    forceSelectionUpdateModelTimeout: any
    onClear: any
    value: any
    multiInputEL: any
    inputEL: any
    multiple: any
    /**
     * 
     * @param event 
     * @returns `true` if the input matches an item from the list (this is differen from primeng)
     */
    onInputChange(event) {
        if (this.forceSelection) {
            let valid = false;
            let inputValue = event.target.value.trim();

            if (this.suggestions) {
                for (let suggestion of this.suggestions) {
                    let itemValue = this.field ? ObjectUtils.resolveFieldData(suggestion, this.field) : suggestion;
                    if (itemValue && inputValue === itemValue.trim()) {
                        valid = true;
                        this.forceSelectionUpdateModelTimeout = setTimeout(() => {
                            this.selectItem(suggestion, false);
                        }, 250);
                        break;
                    }
                }
            }

            if (!valid) {
                if (this.multiple) {
                    this.multiInputEL.nativeElement.value = '';
                }
                else {
                    this.value = null;
                    this.inputEL.nativeElement.value = '';
                }

                this.onClear.emit(event);
                this.onModelChange(this.value);
            }
            return valid
        }
        return true
    }

    selectItem(suggestion, focus) {

    }
    onModelChange(value) {

    }
}