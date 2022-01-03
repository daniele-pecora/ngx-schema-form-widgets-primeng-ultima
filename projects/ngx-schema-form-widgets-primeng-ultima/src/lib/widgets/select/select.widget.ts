/**
 * Created by daniele on 13.07.17.
 */
import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core'
import {BindingRegistry, SchemaValidatorFactory} from 'ngx-schema-form'
import {triggerBinding} from '../bindings-registry-helper'
import {AsyncSelectionWidgetComponent} from "../_base/async-selection-widget.component";
import {WidgetComponentHttpApiService} from "../_service/widget-component-http-api.service";
import { ExpressionCompiler } from '../_service/expression-complier.service';
import { NoHelperTextSpacer } from '../_component-helper/no-helpertext-spacer.widget';


@Component({
  selector: 'ngx-ui-form-section',
  templateUrl: './select.widget.html',
  styleUrls: ['./select.widget.scss', '../_component-helper/no-helpertext-spacer.widget.scss']
})
export class SelectWidgetComponent extends AsyncSelectionWidgetComponent implements OnInit, AfterViewInit, OnDestroy {

  // selectOptions: Array<any>
  // selectedOption: string;

  /** START: this will help to set the width of the dropdown */
  @ViewChild('hiddenSizeHolder')
  hiddenSizeHolder: ElementRef
  pDropdownStyle: any = {}
  hiddenSizeHolderClass = 'placeholderFieldInvisible'

  selectDefaultSize = 20
  _sizeFieldControlValue: number = this.selectDefaultSize // default value for input fields is 20
  set sizeFieldControlValue(size: number) {
    this._sizeFieldControlValue = size
    this.calculateDropdownSize()
  }

  get sizeFieldControlValue(): number {
    return this._sizeFieldControlValue
  }

  autoWidth: boolean

  @ViewChild('dropDownElement')
  dropDownElement: ElementRef

  get appendTo() {
    /**
     * Check if inside a dialog and set `appendTo` to `body`.
     * Remember the state in root `FormProperty` so we don't traverse tree everytime.
     */
    const ____isDialogChild = this.formProperty.root['____dialogChildren'] = this.formProperty.root['____dialogChildren'] || {}
    if (____isDialogChild[this.formProperty.__canonicalPathNotation] === false) {
      return null
    } else if (____isDialogChild[this.formProperty.__canonicalPathNotation]) {
      return 'body'
    }
    let root = this.formProperty.root
    let p = this.formProperty
    while ((p = p.parent)) {
      if (p.schema && p.schema.widget && p.schema.widget.id === 'dialog') {
        ____isDialogChild[this.formProperty.__canonicalPathNotation] = true
        break
      }
      if (p === root || p === this.formProperty) {
        break
      }
    }
    if (____isDialogChild[this.formProperty.__canonicalPathNotation]) {
      return 'body'
    }
    ____isDialogChild[this.formProperty.__canonicalPathNotation] = false
    return null
  }

  constructor(
      protected schemaValidatorFactory: SchemaValidatorFactory
      , protected lookupService: WidgetComponentHttpApiService
      , private bindingRegistry: BindingRegistry
      , protected expressionCompiler: ExpressionCompiler
      , private renderer: Renderer2
      , private elRef: ElementRef) {
    super(schemaValidatorFactory, lookupService, expressionCompiler)
  }

  /** END: this will help to set the width of the dropdown */

  ngOnInit(): void {
    if ('auto' !== this.schema.widget.size) {
      this._sizeFieldControlValue = this.schema.widget.size || this.selectDefaultSize
    }

    // this will call 'this.loadInitialOptions()'
    super.ngOnInit()

    if (!(this.schema.widget || {}).hasOwnProperty('size')) {
      // use input field default size
      this.autoWidth = false
    } else if ((this.schema.widget || {}).size === 'auto') {
      this.autoWidth = true
    } else if ((this.schema.widget || {}).size && (this.schema.widget || {}).size !== 'auto') {
      // if any value is given don't use autoWidth
      this.autoWidth = false
    } else {
      this.autoWidth = true
    }
  }


  protected onLoadingInitialOptionsAjaxStarted() {
    // TODO show some indicator
  }

  protected onLoadingInitialOptionsReady() {
    // TODO show some indicator
  }

  /** START: this will help to set the width of the dropdown */
  ngAfterViewInit() {
    super.ngAfterViewInit()
    if (!this.autoWidth) {
      this.sizeFieldControlValue = this.schema.widget.size || this.selectDefaultSize
    }

    this.__aria_setMissingAriaAttributes()
  }
  // - - - - - - - - - - - - - 
  // FIX ARIA - END
  // - - - - - - - - - - - - - 
  __aria_getAriaHiddenInputEl() {
    const _this = this
    const element = (this.dropDownElement.nativeElement || this.dropDownElement['el'].nativeElement).querySelector('.ui-helper-hidden-accessible input')
    if(element)
    if (!element.___muser) {
      element.___muser = new MutationObserver(function (mutations) {
        mutations.forEach((mutation) => {
          if (mutation.type == "attributes") {
            const attrNewVal = element.getAttribute(mutation.attributeName)
            if ('aria-label' === mutation.attributeName) {
              if (attrNewVal) {
                _this.renderer.setAttribute(element, 'value', attrNewVal)
                _this.renderer.removeAttribute(element, mutation.attributeName)
              }
            } else if ('aria-haspopup' === mutation.attributeName) {
              _this.renderer.removeAttribute(element, mutation.attributeName)
            }
          }
        })
      })
      element.___muser.observe(element, { attributes: true /*listen to attribute changes*/ })
    }
    return element
  }
  __aria_setMissingAriaAttributes() {
    const nativeElement = (this.dropDownElement.nativeElement || this.dropDownElement['el'].nativeElement)
    if (!nativeElement)
      return

    /** hide trigger button, since it has either description nor title attribute set */
    const triggerButton = nativeElement.querySelector('.ui-dropdown-trigger')
    if (triggerButton) {
      this.renderer.setAttribute(triggerButton, 'aria-hidden', 'true')
      this.renderer.setAttribute(triggerButton, 'tabindex', '-1')
    }

    /** convert input to listbox */
    const ariaHelperInput = this.__aria_getAriaHiddenInputEl()

    this.renderer.setAttribute(ariaHelperInput, 'title', (this.schema.title || this.formProperty.path))
    // make read out the label
    this.renderer.setAttribute(ariaHelperInput, 'role', 'listbox')
    this.renderer.removeAttribute(ariaHelperInput, 'aria-label')
    this.renderer.removeAttribute(ariaHelperInput, 'aria-haspopup')

    // setup aria-owns, aria-activedescendant
    const aria_owns = (this.dropDownElement['options'] || []).map((item, index, all) => { return `${this.id}__${index}` })
    this.renderer.setAttribute(ariaHelperInput, 'aria-owns', aria_owns.join(' '))
  }
  __aria_on_create_dropdown_panel(event_element_dropdown_panel) {
    const nativeElement = (this.dropDownElement.nativeElement || this.dropDownElement['el'].nativeElement)
    if (!nativeElement)
      return

    const createOptionID = (id, index) => `${id}_option__${index}`
    // setup options IDs INDEX
    const _optionsValueIdMap = {}
    const dropDownOptions = (this.dropDownElement['options'] || [])
    for (let i = 0; i < dropDownOptions.length; i++) {
      dropDownOptions[i].id = createOptionID(this.id, i)
      _optionsValueIdMap[dropDownOptions[i].value] = dropDownOptions[i].id
    }
    nativeElement['_optionsValueIdMap'] = _optionsValueIdMap

    // setup listbox
    const uList = event_element_dropdown_panel.querySelector('ul[role=listbox].ui-dropdown-items')
    this.renderer.setAttribute(uList, 'aria-labelledby' , this.schema.description)

    // setup aria-owns
    const aria_owns = []
    const options = event_element_dropdown_panel.querySelectorAll('li[role=option]')
    for (let i = 0; i < options.length; i++) {
      options[i].id = createOptionID(this.id, i)
      this.renderer.setAttribute(options[i], 'id', options[i].id)
      this.renderer.setAttribute(options[i], 'data-option-value', this.dropDownElement['options'][i].value)
      aria_owns.push(options[i].id)
    }

    const ariaOwnsElement = this.__aria_getAriaHiddenInputEl()

    // update aria-owns, aria-activedescendant
    this.renderer.setAttribute(ariaOwnsElement, 'aria-owns', aria_owns.join(' '))
    const option_selected = event_element_dropdown_panel.querySelector('li[role=option][aria-selected=true]')
    if (option_selected) {
      this.renderer.setAttribute(ariaOwnsElement, 'aria-activedescendant', option_selected.id)
    } else {
      this.renderer.setAttribute(ariaOwnsElement, 'aria-activedescendant', '')
    }
  }
  __aria_on_dropdown_panel_change_selecteditem(selectedValue){
    const nativeElement = (this.dropDownElement.nativeElement || this.dropDownElement['el'].nativeElement)
    if (!nativeElement)
      return

    const _optionsValueIdMap = nativeElement['_optionsValueIdMap']
    const selectedValueId= _optionsValueIdMap[selectedValue]

    // update aria-owns, aria-activedescendant
    const ariaOwnsElement = this.__aria_getAriaHiddenInputEl()
    if (selectedValueId) {
      this.renderer.setAttribute(ariaOwnsElement, 'aria-activedescendant', selectedValueId)
    } else {
      this.renderer.setAttribute(ariaOwnsElement, 'aria-activedescendant', '')
    }
  }
  onShow(event) {
    this.__aria_on_create_dropdown_panel(event.element)
  }
  onChange_aria(event) {
    this.__aria_on_dropdown_panel_change_selecteditem(event.value)
  }
  onFocus(event) { }
  onHide(event) { }
  // - - - - - - - - - - - - - 
  // FIX ARIA - END
  // - - - - - - - - - - - - - 
  calculateDropdownSize() {
    this.pDropdownStyle['width'] = `${this.hiddenSizeHolder.nativeElement.offsetWidth}px`
  }

  updateSize(event) {
    setTimeout(() => {
      this.calculateDropdownSize()
    }, 10)
  }

  /** END: this will help to set the width of the dropdown */


  onChange(event) {
    this.onChange_aria(event)
    triggerBinding(this, 'change', event, this.bindingRegistry, this.formProperty)
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
