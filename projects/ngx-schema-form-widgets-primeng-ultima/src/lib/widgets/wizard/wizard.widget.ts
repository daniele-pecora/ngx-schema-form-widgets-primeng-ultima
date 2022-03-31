import { AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild, Inject } from '@angular/core'
import { MenuItem } from "primeng/api";
import { ActionObjectLayoutWidgetComponent } from '../_base/action-object-layout.widget.component'
import { IconNameConverterPipe } from '../_converters/_icon/IconNames'
import { SeverityNameConverterPipe } from '../_converters/_severity/SeverityNames'
import { ActionRegistry } from 'ngx-schema-form'
import { FormProperty } from 'ngx-schema-form'
import { Action } from 'ngx-schema-form'
import { ButtonTypeTransformerService } from '../_converters/_button/button-type-transformer.service'
import { DOCUMENT } from '@angular/common'

@Component({
  selector: 'ngx-ui-wizard-widget',
  templateUrl: './wizard.widget.html',
  styleUrls: ['./wizard.widget.scss'],
  providers: [IconNameConverterPipe, SeverityNameConverterPipe]
})
export class WizardWidgetComponent extends ActionObjectLayoutWidgetComponent implements OnInit, AfterViewInit {

  currentPage = 0
  lastPage = 0
  pageChanged = false
  private startPage = 0
  visibleItemsLength
  get updateStepperWidthPercentage() { this.updateStepperSize(); return true }

  //
  items: MenuItem[]
  get readOnly() { return this.schema.readOnly }

  @ViewChild('stepperContainer') stepperContainer: ElementRef
  @ViewChild('scrollHook') scrollHook: ElementRef

  constructor(private this_actionRegistry: ActionRegistry
    , iconNameConverter: IconNameConverterPipe
    , severityNameConverter: SeverityNameConverterPipe
    , buttonTypesConverter: ButtonTypeTransformerService
    , private renderer: Renderer2
    , @Inject(DOCUMENT) private document
    , private hostElementRef: ElementRef) {
    super(this_actionRegistry, iconNameConverter, severityNameConverter, buttonTypesConverter)
  }

  ngAfterViewInit() {
    super.ngAfterViewInit()
    this.updateFocusabilityState(this.schema.widget.startPage || 0)
  }

  ngAfterViewChecked() {
    this.updateStepperSize()
  }

  resetFocus(isFinishPage?: boolean) {
    if (isFinishPage) {
      /**
       * Don't change focus if it's the last page
       */
      return
    }

    /**
     * Find the next tab-header or section-header in wizard and set focussed
     */
    const isAccordion = this.schema.widget.style === 'accordion'
    const elTab = isAccordion ? `[aria-controls="ui-accordiontab-${this.currentPage}-content"]` : `.ui-steps-item:nth-of-type(${this.currentPage + 1}) a`
    const nextActiveElement = this.hostElementRef.nativeElement.querySelector(`${elTab}`)
    if (nextActiveElement) {
      if (!nextActiveElement.hasAttribute('tabindex')) {
        /** To make `.focus()` work on Chrome attribute `tabindex` must exists */
        nextActiveElement.setAttribute('tabindex', '-1')
      }
      setTimeout(() => { nextActiveElement.focus() }, 0)
    } else {
      /** 
       * Fallback:
       * if no valid tab or section to focus is found then 
       * detach the focus at all so it starts from top body
       */
      if (this.document.activeElement) {
        this.document.activeElement.blur()
      }

      const nextFocus = this.document.querySelector(`input, textarea, select`)
      if (nextFocus) {
        /**
         * To detach the focus from the 'Next' button we must
         * set the focus on the first available item and then release it 
         */
        nextFocus.focus()
        nextFocus.blur()
      }
    }
  }

  activeIndexChange(event, isFinishPage?: boolean) {
    this.updateFocusabilityState(event)
    this.resetFocus(isFinishPage)
  }

  private updateFocusabilityState(activeIndex) {
    if (this.readOnly) {
      /**
       *
       * Disable focus for all items except the active one
       */
      const allStepperItemLinks: Array<ElementRef> = this.stepperContainer.nativeElement.querySelectorAll('.ui-steps-item a') || []
      if (allStepperItemLinks.length)
        for (let i = 0; i < allStepperItemLinks.length; i++) {
          if (activeIndex === i)
            this.renderer.removeAttribute(allStepperItemLinks[i], 'tabindex') // css class .ui-state-highlight
          else
            this.renderer.setAttribute(allStepperItemLinks[i], 'tabindex', '-1') // css class .ui-state-disabled
        }
    }
  }

  ngOnInit() {
    super.ngOnInit()

    this.items = []

    for (let i = 0; i < this.schema.fieldsets.length; i++) {
      const fs = this.schema.fieldsets[i]
      const item: WizardMenuItem = {
        label: (this.schema.widget['stepper'] || {})[fs.id] || fs.name || fs.title,
        command: (event: any) => {
          let setIndex = null
          const id = fs.id
          const visibleItems = this.filterHiddenItems(this.schema.fieldsets)
          for (let i = 0; i < visibleItems.length; i++) {
            if (id === visibleItems[i]['id']) {
              setIndex = i
              break
            }
          }
          this.currentPage = null !== setIndex ? setIndex : i
        },
        fieldset: this.schema.fieldsets[i]
      }
      this.items.push(item)
    }

    if (this.schema.widget.startPage && this.schema.widget.startPage > 0 && this.schema.widget.startPage < this.filterHiddenItems(this.items).length)
      this.startPage = this.schema.widget.startPage

    this.currentPage = this.startPage || 0
  }

  previousPage() {
    this.processAction('prev', this.addNavigationInfoPageIds({ fromPage: this.currentPage, toPage: this.currentPage - 1 }))
    if (this.currentPage > 0) {
      --this.currentPage
    }
    this._onPageChange()
  }

  nextPage() {
    this.processAction('next', this.addNavigationInfoPageIds({ fromPage: this.currentPage, toPage: this.currentPage + 1 }))
    if (this.hasNextPage()) {
      ++this.currentPage
    }
    this._onPageChange()
  }

  finishPage() {
    this.processAction('finish', this.addNavigationInfoPageIds({ fromPage: this.currentPage, toPage: this.currentPage + 1 }))
    if (this.hasNextPage()) {
      ++this.currentPage
    }
    this._onPageChange(true)
  }

  private _onPageChange(isFinishPage?: boolean) {
    // this.scrollToTop()
    this.scrollIntoView()
    this.activeIndexChange(this.currentPage, isFinishPage)
    this.pageChanged = true
    this.showCurrentStep()
  }

  hasPreviousPage() {
    return this.currentPage > 0
  }

  hasNextPage() {
    return this.currentPage + 1 < this.filterHiddenItems(this.schema.fieldsets).length
  }

  getCurrentIndex() {

    return this.currentPage
  }

  logPage(stepIndex) {
    // console.log('logPage(index)', stepIndex)
  }

  isCurrentPageValid() {
    return this.isPageValid(this.currentPage)
  }

  isPageValid(index) {
    const visibleItems = this.filterHiddenItems(this.schema.fieldsets)
    if (visibleItems.length !== this.visibleItemsLength) {
      this.visibleItemsLength = visibleItems.length
      this.updateStepperSize()
    }
    for (const fieldId of /*this.schema.fieldsets*/visibleItems[index]['fields']) {
      const childProp: FormProperty = this.formProperty.getProperty(fieldId);
      if (!childProp) {
        /**
         * This may happen when setting formProperty children has not been processed yet.<br/>
         * This method will be called a second time with existing children, so for now just skip ...
         */
        return false
      }
      if (!childProp.valid) {
        return false
      }
    }
    return true
  }

  selectionChange(event) {
    const index = event
    if (index !== this.currentPage) {
      const pageNav: WizardPageNavInfo = { fromPage: 0, toPage: 0 }
      pageNav.fromPage = this.currentPage
      pageNav.toPage = index
      this.processAction(index < this.currentPage ? 'prev' : 'next', this.addNavigationInfoPageIds(pageNav))
    }
    this.currentPage = index
    this.scrollIntoView()
    this.updateFocusabilityState(index)
    const isFinishPage = !this.hasNextPage()
    this.resetFocus(isFinishPage)
  }

  processAction(actionName, params?: any) {
    const actionId = ((this.schema.widget.buttons || {})[actionName] || {}).actionId
    if (actionId) {
      const action: Action = this.this_actionRegistry.get(actionId)
      if (action) {
        action(this.formProperty, params)
      }
    }
  }

  getLabel(topLabel: string, buttonProp: object, buttonName: string) {
    if (topLabel || topLabel === '') {
      return topLabel
    }
    if (buttonProp && (buttonProp['label'] || buttonProp['label'] === '')) {
      return buttonProp['label']
    }
    return buttonName
  }

  scrollToTop() {
    const DEFAULT_SCROLL_TO_TOP = true
    let doScroll = DEFAULT_SCROLL_TO_TOP
    if (this.schema.widget) {
      const scrollDisabled = (this.schema.widget.hasOwnProperty('disableScrollToTop') && this.schema.widget.disableScrollToTop === true)
      if (!scrollDisabled) {
        const scrollToTop = this.schema.widget.scrollToTop || []
        if (this.schema.fieldsets) {
          if (this.schema.fieldsets[this.getCurrentIndex()] !== undefined) {
            const currentFieldSetId = this.schema.fieldsets[this.getCurrentIndex()].id
            if (scrollToTop[currentFieldSetId] !== undefined) {
              doScroll = false !== scrollToTop[currentFieldSetId]
            }
          }
        } else {
          doScroll = true
        }
      } else {
        doScroll = !scrollDisabled
      }
    }
    if (doScroll) {
      document.defaultView.scrollTo(0, 0)
    }
  }

  private showCurrentStep() {
    if ((!this.schema.widget.style || (this.schema.widget.style && this.schema.widget.style !== 'accordion'))
      && (!this.schema.widget.stepperVertical || (this.schema.stepperVertical && this.schema.widget.stepperVertical === 0))) {
      let items = this.stepperContainer.nativeElement.querySelectorAll('.ui-steps-item')
      if (this.currentPage > this.lastPage) {
        if (items[this.currentPage].classList.contains('vanished')) {
          this.renderer.removeClass(items[this.currentPage], 'vanished')
          this.renderer.addClass(items[this.currentPage - 1], 'vanished')
        } else {
        }
      } else if (this.currentPage < this.lastPage) {
        if (items[this.lastPage - 1].classList.contains('vanished')) {
          this.renderer.removeClass(items[this.lastPage - 1], 'vanished')
          this.renderer.addClass(items[this.lastPage], 'vanished')
        } else {
        }
      }
    }
    this.lastPage = this.currentPage
  }

  private calculateStepperItemsCount() {
    if (window.innerWidth > 640 && this.stepperContainer && this.stepperContainer.nativeElement &&
      (!this.schema.widget.stepperVertical || (this.schema.stepperVertical && this.schema.widget.stepperVertical === 0))) {
      let stepperWidth = this.stepperContainer.nativeElement.offsetWidth
      let items = this.stepperContainer.nativeElement.querySelectorAll('.ui-steps-item')
      if (items) {
        const last = items[items.length - 1]
        let stopMeter = last.offsetWidth + 100

        let shortenedStepper = false
        for (let i = 0; i < items.length - 1; i++) {
          stopMeter = stopMeter + items[i].offsetWidth
          if (stopMeter > stepperWidth || items[i].offsetWidth === 0) {
            for (let j = i; j < items.length - 1; j++) {
              shortenedStepper = true
              if (!items[j].classList.contains('ui-steps-current')) {
                this.renderer.addClass(items[j], 'vanished')
              } else {
                this.renderer.removeClass(items[j], 'vanished')
              }
            }
            break
          }
        }
        if (shortenedStepper) {
          this.renderer.addClass(this.stepperContainer.nativeElement, 'ui-steps-oversize')
        } else {
          this.renderer.removeClass(this.stepperContainer.nativeElement, 'ui-steps-oversize')
        }
      }
    }
  }

  private udpateStepperTitles() {
    let items = (this.stepperContainer || this.hostElementRef).nativeElement.querySelectorAll('.ui-steps-title')
    if (items)
      for (let i = 0; i < items.length; i++) {
        // update title attribute
        this.renderer.setAttribute(items[i].parentNode, 'title', items[i].innerText || items[i].innerHTML)
      }
  }

  private updateStepperSize() {
    if (!this.pageChanged) {
      this.calculateStepperItemsCount()
      this.udpateStepperTitles()
    }
    this.pageChanged = false

    /*     if (this.stepperContainer && this.stepperContainer.nativeElement) {
          const lenPercentage = 100 / this.filterHiddenItems(this.items).filter(item => !item['fieldset'].hidden).length
          const allStepperItems: Array<ElementRef> = this.stepperContainer.nativeElement.querySelectorAll('.ui-steps-item') || []
          if (allStepperItems.length)
            for (let i = 0; i < allStepperItems.length; i++) {
              this.renderer.removeStyle(allStepperItems[i], 'width')
              this.renderer.setStyle(allStepperItems[i], 'width', `${lenPercentage}%`)
            }
        } */
  }

  /**
   * This is only called on manual tap on section header
   */
  onTabOpen_Accordion(event: any) {
    event.originalEvent.preventDefault()
    const index = event['index']
    if (index !== this.currentPage)
      this.processAction(index < this.currentPage ? 'prev' : 'next', this.addNavigationInfoPageIds({ fromPage: this.currentPage, toPage: this.currentPage + 1 }))

    this.currentPage = index;
    this.activeIndexChange(this.currentPage)
  }

  /**
   * This is only called on manual tap on section header
   */
  onTabClose_Accordion(event: any) {

  }

  scrollIntoView() {
    const scrollDisabled = (this.schema.widget.hasOwnProperty('disableScrollToTop') && this.schema.widget.disableScrollToTop === true)
    if (scrollDisabled)
      return
    const scrollOptions = { behavior: 'smooth', inline: 'start', block: 'start' }
    if (this.scrollHook.nativeElement.scrollIntoViewIfNeeded) {
      this.scrollHook.nativeElement.scrollIntoViewIfNeeded()
    } else {
      this.scrollHook.nativeElement.scrollIntoView(scrollOptions)
    }
  }

  filterHiddenItems(items): object[] {
    if (true !== this.schema.widget['live']) {
      return items
    }
    const filteredItems = items.filter((item, index, all) => {
      return !item.hidden
    })
    return filteredItems
  }

  filterHiddenSteps(items: WizardMenuItem[]): WizardMenuItem[] {
    if (true !== this.schema.widget['live']) {
      return items
    }
    const filteredItems = items.filter((item, index, all) => {
      return !item.fieldset.hidden
    })
    return filteredItems
  }

  addNavigationInfoPageIds(navInfo: WizardPageNavInfo): WizardPageNavInfo {
    const visiblePages = this.filterHiddenItems(this.schema.fieldsets) || []
    navInfo.fromPageId = (visiblePages[navInfo.fromPage] || { id: undefined })['id']
    navInfo.toPageId = (visiblePages[navInfo.toPage] || { id: undefined })['id']
    return navInfo
  }
}

export interface WizardPageNavInfo {
  fromPage: number
  toPage: number
  fromPageId?: string
  toPageId?: string
}

export interface WizardMenuItem extends MenuItem {
  fieldset: any
}