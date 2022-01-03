/**
 * Created by daniele on 14.04.19.
 */
import { Component, OnDestroy, ElementRef, SecurityContext, Inject, Renderer2 } from "@angular/core";
import { ObjectLayoutWidget, FormProperty, ArrayProperty } from "ngx-schema-form";
import { Subscription } from 'rxjs'
import { SafeHtml } from '@angular/platform-browser'
import { JEXLExpressionCompiler } from "../_service/expression-complier.service"
import { DataConverterRegistryPipe, Converter } from '../_converters/_data/data-converter-registry.pipe'
import { DataConverterTransformerRegistry } from '../_converters/_data/data-converter-transformer.registry'
import { DOCUMENT } from "@angular/common";

@Component({
    selector: 'ngx-ui-form-table',
    templateUrl: './table.widget.html',
    styleUrls: ['./table.widget.scss'],
    providers: [JEXLExpressionCompiler, DataConverterRegistryPipe, DataConverterTransformerRegistry]
})
export class TableWidgetComponent extends ObjectLayoutWidget implements OnDestroy {
    model = {
        cols: [],
        values: []
    }

    subs: Subscription[] = []
    expressionPathSubs: {
        [key: string]: Subscription
    } = {}

    /** aria-sort */
    sortOrder //none, ascending, descending
    sortedField

    /** col-group */
    get colGroupWidth(): number {
        return this.calculateColGroupWidth()
    }
    colGroupWidthCalculated: boolean

    constructor(private dataConverterTransformerRegistry: DataConverterTransformerRegistry
        , @Inject(DOCUMENT) private document
        , private elementRef: ElementRef
        , private renderer: Renderer2) {
        super()
    }

    ngAfterViewInit() {
        super.ngAfterViewInit()

        const style = ((this.schema || {}).widget || {}).style
        const isModelBasedTable = !style || style === 'default' || style === 'normal'

        const callbackAfterPreparedModel = () => {
            if (isModelBasedTable) {
                // model based complex table
            } else {
                // simple key value table
            }
        }

        // init model
        if (isModelBasedTable) {
            this.initModel(callbackAfterPreparedModel)
        }
        this.setupPaginatorLinksTooltip()
    }

    setupPaginatorLinksTooltip() {
        const paging = this.schema.widget.paging || {}
        paging.labels = paging.labels || {}
        const first = paging.labels.first
        const last = paging.labels.last
        const next = paging.labels.next
        const prev = paging.labels.prev
        const labels = {
            'ui-paginator-first': first || 'First page',
            'ui-paginator-last': last || 'Last page',
            'ui-paginator-prev': prev || 'Previous page',
            'ui-paginator-next': next || 'Next page'
        }
        for (const key of Object.keys(labels)) {
            const el = this.elementRef.nativeElement.querySelector(`.${key}`)
            // console.log('el:::::', el)
            if (el) {
                if (!el.getAttribute('title')) {
                    this.renderer.setAttribute(el, 'title', labels[key])
                }
                if (!el.getAttribute('aria-label')) {
                    this.renderer.setAttribute(el, 'aria-label', labels[key])
                }
            }
        }
        // add label to dropdown
        const perPage = paging.labels.perPage
        if (perPage) {
            const dropDownElement_nativeElement = this.document.querySelector('.ui-paginator-bottom .ui-dropdown-label-container')
            if (dropDownElement_nativeElement) {
                const el = this.document.createElement('span')
                el.appendChild(this.document.createTextNode(perPage))
                this.renderer.insertBefore(dropDownElement_nativeElement.parentNode, el, dropDownElement_nativeElement)

                // add aria-label to hidden input
                // make screen reader reading out the `perPage` label and the selected value
                const __aria_getAriaHiddenInputEl = () => {
                    const _this = this
                    const element = this.document.querySelector('.ui-paginator-bottom .ui-dropdown .ui-helper-hidden-accessible input')
                    if (element) {
                        this.renderer.setAttribute(element, 'title', perPage)
                        this.renderer.setAttribute(element, 'aria-label', perPage)
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
                    }
                    return element
                }
                __aria_getAriaHiddenInputEl()
            }
        }

    }

    initModel(callback?: () => void): any {

        this.unsubscribe()

        const modelPath = (this.schema.widget.model || { path: '' }).path
        const modelTable = (this.schema.widget.model || { table: null }).table

        if (modelPath) {
            /**
             * something like : /complexTypes/wizard/property-2
             */
            const modelProperty = this.formProperty.searchProperty(modelPath)
            this.subs.push(modelProperty.valueChanges.subscribe(() => {
                this.getModelFromPath(modelProperty, modelPath, callback)
            }))
        } else if (modelTable) {
            this.getModelFromTableModel(modelTable, callback)
        } else {
            console.warn('No model.path or model.table defined')
        }
    }

    private getModelFromTableModel(modelTable: any, callback?: () => void) {
        this.model.cols = this.processIncludesExcludes(modelTable.columns)
        this.model.values = modelTable.data

        if (callback) {
            callback()
        }
    }

    private processIncludesExcludes(columns: any) {
        const includes = this.schema.widget.model.includes as Array<string>
        const excludes = this.schema.widget.model.excludes as Array<string>

        if (!(includes || []).length && !(excludes || []).length)
            return columns

        let cols = [...columns]
        cols = cols.filter((item, index, all) => {
            return (!(includes || []).length || -1 !== includes.indexOf(item.field)) &&
                (!(excludes || []).length || -1 === excludes.indexOf(item.field));
        })
        return cols
    }

    private getModelFromPath(modelProperty: FormProperty, modelPath: string, callback?: () => void) {
        const getColsInfo = (modelFormProp) => {

            const createPath = (path: string): string => {
                return path
                    // remove the trailing target object path
                    .replace(modelPath, '')
                    // remove any trailing array indicator
                    .replace(new RegExp('^/?\\*?/?'), '')
                    // replace array indicator to point to the first item
                    .replace(new RegExp('\\*/', 'g'), '0/')
            }

            let _cols = []
            if ((modelFormProp as any).hasOwnProperty('propertiesId') /** is an object: 'propertiesId' contains the properties order */) {
                for (const pId of modelFormProp['propertiesId']) {
                    const formProp = modelFormProp['properties'][pId] as FormProperty
                    if ((formProp as any).hasOwnProperty('propertiesId')) {
                        const colVal = getColsInfo(formProp)
                        _cols = _cols.concat(colVal.cols)
                    } else {
                        _cols.push({
                            field: createPath(formProp.path)
                            , header: formProp.schema.title || formProp.path
                        })
                    }
                }
            } else if (modelProperty instanceof ArrayProperty /** is an array */) {
                if (modelProperty.schema.items.type === 'object') {
                    const formProps = modelProperty['properties']
                    let colsSet = false
                    for (const prop of formProps as FormProperty[]) {
                        const colVal = getColsInfo(prop)
                        if (!colsSet)
                            _cols = _cols.concat(colVal.cols)
                        colsSet = true
                    }
                } else {
                    _cols.push({
                        field: createPath(modelProperty.path)
                        , header: modelProperty.schema.items.title || modelProperty.path
                    })
                }
            } else /** is a simple property */ {
                _cols.push({
                    field: createPath(modelProperty.path)
                    , header: modelProperty.schema.items.title || modelProperty.path
                })
            }
            return { cols: _cols }
        }

        // get colums
        const colsInfo = getColsInfo(modelProperty)
        colsInfo.cols = this.processIncludesExcludes(colsInfo.cols)
        this.model.cols = colsInfo.cols

        // get values
        let formProps = []
        if (modelProperty instanceof ArrayProperty /** is an array */) {
            formProps = formProps.concat(formProps, modelProperty['properties'])
        } else {
            formProps.push(modelProperty)
        }

        const values = []

        for (const formProp of formProps) {
            const row = {}
            for (const col of colsInfo.cols) {
                if (formProp.getProperty) {
                    const prop = formProp.getProperty(col.field)
                    row[col.field] = prop.value
                }
            }
            values.push(row)
        }
        this.model.values = values

        if (callback) {
            callback()
        }
    }

    unsubscribe() {
        if (this.subs) {
            try {
                for (const sub of this.subs) {
                    sub.unsubscribe()
                }
            } catch (error) {
                console.warn(error)
            }
        }
        if (this.expressionPathSubs) {
            try {
                for (const subKey of Object.keys(this.expressionPathSubs)) {
                    if (this.expressionPathSubs[subKey])
                        this.expressionPathSubs[subKey].unsubscribe()
                }
            } catch (error) {
                console.warn(error)
            }
        }
    }

    ngOnDestroy() {
        this.unsubscribe()
    }
    /**
     * This method may be used instead of the pipe <code>DataConverter</code> since
     * when used then the content has change detection otherwise it no change are recognized.
     * @param value 
     * @param formProperty 
     * @param transformer 
     */
    calculateValue(value: any, formProperty: FormProperty, transformer: any): any | SafeHtml {
        if (!transformer)
            return value
        const val = this.dataConverterTransformerRegistry.getTransformer(transformer.type).transform(value, formProperty, transformer as Converter)
        return val
    }

    transformerStatus(transformer: any): boolean {
        if (!transformer)
            return false

        if (transformer.path) {
            const a = this.formProperty.findRoot().searchProperty(transformer.path)
            if (a) {
                if ((transformer.type || '') === 'expression') {
                    /*
                    this.expressionPathSubs[transformer.path] = this.expressionPathSubs[transformer.path] || a.valueChanges.subscribe(() => {
                        console.log('++++++HAS CHANGED', transformer, a, this)
                    })
                    const watcher: boolean = !(!this.expressionPathSubs[transformer.path])
                    */
                }
            } else {
                console.warn(`Form-property not found. Can't register a watcher on the property path '${transformer.path}' defined in transformer '${transformer.type}'.`, transformer.path)
            }
        }

        const found = this.dataConverterTransformerRegistry.findTransformer('bbcode', transformer)
        return found
    }

    onSort(event) {
        this.sortedField = event['field']
        this.sortOrder = 'none'
        if (1 === event['order']) {
            this.sortOrder = 'ascending'
        } else if (-1 === event['order']) {
            this.sortOrder = 'descending'
        }
    }

    getSortLabel(col) {
        // replacement for since they have been removed from p-sortIcon
        //  [ariaLabel]="col.sortAriaLabel" [ariaLabelDesc]="col.sortAriaLabelDesc" [ariaLabelAsc]="col.sortAriaLabelAsc"
        if (this.sortedField === col.field)
            if ('ascending' === this.sortOrder) {
                return col.sortAriaLabelAsc
            } else if ('descending' === this.sortOrder) {
                return col.sortAriaLabelDesc
            }
        return col.sortAriaLabel
    }

    /**
     * should only be called if `this.formProperty.schema.widget.keyColGroup` is set
     */
    calculateColGroupWidth(largestOrSmallest: boolean = true) {
        // console.log('this.elementRef.nativeElement', this.elementRef.nativeElement)
        const els = this.elementRef.nativeElement.querySelectorAll(`[data-colGroup=${this.formProperty.schema.widget.keyColGroup}]`)
        let width = -1
        if (els) {
            for (let i = 0; i < els.length; i++) {
                // console.log('els[i].offsetWidth', els[i].offsetWidth)
                if (largestOrSmallest) {
                    width = els[i].offsetWidth > width ? els[i].offsetWidth : width
                } else {
                    width = width > 0 && els[i].offsetWidth < width ? els[i].offsetWidth : width
                }
            }
        }
        return width
    }

    getGlobalStyleDef(): HTMLElement {
        const head = this.document.getElementsByTagName('head')[0];
        let style = head.querySelector(`[data-globalStyleColGroup=${this.formProperty.schema.widget.keyColGroup}]`) as HTMLElement
        if (!style) {
            style = this.document.createElement('style');
            style.setAttribute('data-globalStyleColGroup', `${this.formProperty.schema.widget.keyColGroup}`)
            style['type'] = 'text/css'
            head.appendChild(style)

            // convenience...
            style['getColWidth'] = () => {
                return Number.parseInt(style.getAttribute('data-globalStyleColGroupWidth') || '-1')
            }
            style['updateColWidth'] = (colWidth: number) => {
                style.setAttribute('data-globalStyleColGroupWidth', `${colWidth}`)
                style.innerHTML = `
                .dataColGroupTable [data-colGroup=${this.formProperty.schema.widget.keyColGroup}]{
                    width: ${colWidth}px;
                }
            `
            }
            style['colWidthStyleBackup'] = () => {
                style.innerHTML = style.innerHTML.replace(
                    `[data-styleColGroup=${this.formProperty.schema.widget.keyColGroup}]`,
                    `[data-styleColGroup=____${this.formProperty.schema.widget.keyColGroup}]`
                )
            }
            style['colWidthStyleRestore'] = () => {
                style.innerHTML = style.innerHTML.replace(
                    `[data-styleColGroup=____${this.formProperty.schema.widget.keyColGroup}]`,
                    `[data-styleColGroup=${this.formProperty.schema.widget.keyColGroup}]`
                )
            }
        }

        return style
    }

    calculateColGroupStyle() {
        const keyColWidth = `${this.formProperty.schema.widget.keyColWidth}`
        if ('max' !== keyColWidth && 'min' !== keyColWidth) {
            return ''
        }

        const largestOrSmallestCol = 'max' === keyColWidth

        const style = this.getGlobalStyleDef() as any

        // 1. deactivate global style definition
        style.colWidthStyleBackup()

        // 2. calculate col cell width
        const _colwidth = this.calculateColGroupWidth()

        // 3. set col width
        if (largestOrSmallestCol && _colwidth > style.getColWidth()) {
            style.updateColWidth(_colwidth)
        } else if (!largestOrSmallestCol && (_colwidth < style.getColWidth() || style.getColWidth() < 0)) {
            style.updateColWidth(_colwidth)
        } else {
            // ... or restore
            style.colWidthStyleRestore()
        }
        this.colGroupWidthCalculated = true
        return ''
    }

}