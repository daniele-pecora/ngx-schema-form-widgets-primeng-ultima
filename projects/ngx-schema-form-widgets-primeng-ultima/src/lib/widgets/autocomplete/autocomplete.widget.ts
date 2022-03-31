import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { ControlWidget } from 'ngx-schema-form'
import { FormProperty } from 'ngx-schema-form'
import { WidgetComponentHttpApiService } from '../_service/widget-component-http-api.service'
import { Subscription } from 'rxjs'
import { AutocompleteAsyncHelper, KeyValuePair } from "../_base/autocomplete-async-helper"
import { ExpressionCompiler } from '../_service/expression-complier.service'
import { AutoComplete } from 'primeng/autocomplete'
import { AnimationEvent } from '@angular/animations';
import { NoHelperTextSpacer } from '../_component-helper/no-helpertext-spacer.widget'
import { TargetsHelper } from '../_component-helper/_targets.helper'
import { PrimeNgOverrides_OnInputChange } from './primeng.overrides'
import { IsFormPropertyRequiredAttributeStringPipe } from '../_pipe/IsRequiredField'

@Component({
  selector: 'ngx-ui-autocomplete-widget',
  templateUrl: './autocomplete.widget.html',
  styleUrls: ['./autocomplete.widget.scss', '../_component-helper/no-helpertext-spacer.widget.scss']
})
export class AutoCompleteWidgetComponent extends NoHelperTextSpacer implements OnInit, AfterViewInit, OnDestroy {

  text: string;
  _results: any[];
  get results() {
    return this._results
  }
  set results(results: any[]) {
    //console.error('set results(results: any[]) {', new Error('stacktracing...'), 'results:', results)
    this._results = results
  }
  resultMap: KeyValuePair[]
  resultMapIndex: {}
  valueChangeSub: Subscription

  helper: AutocompleteAsyncHelper

  get asMultiselect(): boolean { return ((this.schema.items && this.schema.items.anyOf) || (`${this.schema.type}` === 'array' && (-1 !== ['string', 'number', 'boolean'].indexOf(`${this.schema.items.type}` || 'noitemtypeset')))) }
  @ViewChild('autocomplete') autocompletePWidget: AutoComplete


  get forceSelection() {
    return this.schema && this.schema.widget && this.schema.widget.forceSelection
  }

  targetsHelper: TargetsHelper
  constructor(private lookupService: WidgetComponentHttpApiService, private expressionCompiler: ExpressionCompiler) {
    super()
  }

  ngOnInit(): void {
    this.targetsHelper = new TargetsHelper(this.formProperty, this.expressionCompiler)
  }


  ngAfterViewInit(): void {
    super.ngAfterViewInit();
    if (this.valueChangeSub) {
      this.valueChangeSub.unsubscribe()
    }

    this.valueChangeSub = this.formProperty.valueChanges.subscribe((newValue) => {
      this.updateTargets(newValue)
    })


    const org_onOverlayAnimationDone = this.autocompletePWidget.onOverlayAnimationDone.bind(this.autocompletePWidget)//Fix: TypeError: Cannot set property '_suggestions' of undefined
    this.autocompletePWidget.onOverlayAnimationDone = (event: AnimationEvent) => {
      if (this.forceSelection) {
        // prevent from clearing the `suggestions` which will cause clear the value of the input field
      } else {
        org_onOverlayAnimationDone(event)
      }
    }

    // 
    const org_onInputChange = this.autocompletePWidget.onInputChange.bind(this.autocompletePWidget)//Fix: Prevent deleting input field before filling it with new value
    this.autocompletePWidget.onInputChange = (event: Event) => {
      const value = this.autocompletePWidget.value
      const nativeValue = this.autocompletePWidget.inputEL.nativeElement.value

      if (this.forceSelection) {
        const valid = new PrimeNgOverrides_OnInputChange().onInputChange.bind(this.autocompletePWidget)(event)
        if (!valid) {
          this.showForceSelectionErrorIfNecessary()
        }
        // restore values if it has been nulled out by `onInputChange`
        if (null == this.autocompletePWidget.value) {
          this.autocompletePWidget.value = value
          if (!this.autocompletePWidget.inputEL.nativeElement.value) {
            this.autocompletePWidget.inputEL.nativeElement.value = nativeValue
          }
        }
      } else {
        org_onInputChange(event)
      }
    }
  }

  showForceSelectionErrorIfNecessary() {
    const input_required = new IsFormPropertyRequiredAttributeStringPipe().transform(this.formProperty)
    // create error message
    const errorSchema = this.schema.widget.forceSelectionError || {}
    const errorWhenNotRequired = errorSchema.errorWhenNotRequired || false
    const showErrorWhenNotSelected = (input_required || errorWhenNotRequired)
    if (showErrorWhenNotSelected) {
      // Tell the validation that field is not valid due to not selecting item from list
      const errorCode = errorSchema.errorCode || 'OBJECT_MISSING_REQUIRED_PROPERTY'
      const errorMessage = errorSchema.errorMessage || 'Please select item from list'
      const errMsg = {
        code: errorCode,
        path: `#${this.formProperty.path}`,
        message: `${errorMessage}`,
        params: [],
        severity: 'error',
        title: errorMessage
      }
      this.formProperty.extendErrors([errMsg])
      const _errorList = this.formProperty['_errors']
      if (_errorList && _errorList.length) {
        // make sure error is at first position
        _errorList.reverse()
      }
    }
  }

  getAutocompleteAsyncHelper(): AutocompleteAsyncHelper {
    if (this.helper) {
      this.helper.ngOnDestroy()
    }
    this.helper = new AutocompleteAsyncHelper(this.name, this.formProperty, this.schema, this.lookupService, this.expressionCompiler)
    return this.helper
  }

  matchExpression(itemValue, queryValue) {
    if (this.schema.widget.matchExpression) {
      let value
      try {
        value = this.expressionCompiler.evaluate(this.schema.widget.matchExpression, { value: itemValue, query: queryValue })
        return value
      } catch (error) {
        console.error(
          'Failed to process match expression:', this.schema.widget.matchExpression,
          ' for value:', itemValue,
          ' and query:', queryValue,
          ' ERROR:', error)
      }
    }
    return 0 === `${itemValue}`.toLowerCase().indexOf(`${queryValue}`.toLowerCase())
  }

  search(event) {
    const preDefinedValues = this.schema.items ? (this.schema.items.anyOf || this.schema.items.oneOf) : null
    if (preDefinedValues) {
      /**
       * use predefined values
       */
      this.results = []
      this.resultMap = []
      this.resultMapIndex = {}
      // if(event.query)
      for (const item of preDefinedValues) {
        if (this.matchExpression(item.description, event.query)) {
          const useKey = item.enum[0] || item.description || item.title
          const useValue = useKey
          this.results.push(useKey)
          this.resultMap.push({ key: useKey, value: useValue })
          this.resultMapIndex[`_${useKey}`] = useValue
        }
      }
      return
    }
    /** do asynch autocomplete */
    const helper = this.getAutocompleteAsyncHelper()
    /**
     * Finally add the query replacement
     */
    const additionalReplacements = { '__ac_query__': event.query }
    const onComplete = (keyValueMap: KeyValuePair[], keys) => {
      this.results = []
      this.resultMap = []
      this.results = keys
      this.resultMap = keyValueMap
      this.resultMapIndex = {}
      if ((this.resultMap || []).length) {
        for (const item of this.resultMap) {
          this.resultMapIndex[`_${item.key}`] = item.value
        }
      }
    }
    helper.search(additionalReplacements, onComplete)
  }

  handleDropdown(event) {
    // event.query = current value in input field
    this.resetResults()
    this.search(event)
  }

  onChange(event) {
    if (this.asMultiselect) { this.updateInputField() }
    this.updateTargets(event)
    this.resetResultsIfNotInForceSelectionMode()
  }
  onClear(event) {
    // Fix: Expected type string but found type null
    // reset to empty but not `null`
    this.control.setValue('')
  }
  onSelect(event) {
    if (this.asMultiselect) { this.updateInputField() }
    this.updateTargets(event)
    this.resetResultsIfNotInForceSelectionMode()
  }

  // multiselect
  onUnselect(event) {
    if (this.asMultiselect) { this.updateInputField() }
    this.resetResults()
  }

  onHide(event) {
    //console.log('onHide(event) ', this.autocompletePWidget)
    //this.autocompletePWidget.suggestions = this.results
  }
  // multiselect
  onKeyUp(event) {
    /* here not necessary yet
    if(this.asMultiselect){
      this.updateInputField()
    }*/
  }

  resetResultsIfNotInForceSelectionMode() {
    // prevent from clearing the `suggestions` which will cause clear the value of the input field
    if (!this.forceSelection) {
      this.resetResults()
    }
  }


  private resetResults() {
    this.results = []
    this.resultMap = []
    this.resultMapIndex = {}
  }

  private updateTargets(value: string) {
    if (this.resultMap) {
      this.targetsHelper.setTargetValues(this.getValueObjectFromResultMap(value) || {})
    }
  }

  private getValueObjectFromResultMap(key: string): object {
    // TODO optimize searching for values (e.g. Proxy on set and get)
    return this.resultMapIndex[`_${key}`]
  }

  ngOnDestroy(): void {
    if (this.valueChangeSub) {
      this.valueChangeSub.unsubscribe()
    }
    if (this.helper) {
      this.helper.ngOnDestroy()
    }
  }

  // multiselect
  checkMax() {
    if (this.schema.hasOwnProperty('maxItems')) {
      const remaining = (this.schema.maxItems || 0) - (this.formProperty.value || []).length
      return (remaining > 0)
    }
    return true
  }

  // multiselect
  updateInputField() {
    if (!this.checkMax()) {
      this.autocompletePWidget.inputFieldValue = ''
      this.autocompletePWidget.renderer.setAttribute(this.autocompletePWidget.multiInputEL.nativeElement, 'disabled', 'disabled')
    } else {
      this.autocompletePWidget.renderer.removeAttribute(this.autocompletePWidget.multiInputEL.nativeElement, 'disabled')
    }
  }

}
