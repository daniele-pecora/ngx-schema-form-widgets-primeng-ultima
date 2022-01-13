/**
 * Created by daniele on 12.07.17.
 */
import { AfterViewInit, Component, OnInit, Renderer2, ViewChild, ElementRef, Inject } from "@angular/core";
import { ControlWidget } from "ngx-schema-form";
import { DateValueConverter } from "./date-value.converter";
import { DateFormatHelper } from './date-format-helper'
import { inputDateAutoComplete, setDateInputEditListener } from './date.autocomplete'
import { BindingRegistry } from 'ngx-schema-form'
import { triggerBinding } from '../bindings-registry-helper'
import { NoHelperTextSpacer } from "../_component-helper/no-helpertext-spacer.widget";
import { escapeForCSSId } from "../_utils/utils";

@Component({
    selector: 'ngx-ui-date-widget',
    templateUrl: './date.widget.html',
    styleUrls: ['../_component-helper/no-helpertext-spacer.widget.scss'
        , './date.widget.scss'
    ]
})
//TODO when typing the date we must check the format to make the input match
export class DateWidgetComponent extends NoHelperTextSpacer implements OnInit, AfterViewInit {
    // TODO extend locales
    locales = {
        en: {
            firstDayOfWeek: 0,
            dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            dayNamesMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
            monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            dateFormat: "mm/dd/yy"
        },
        de: {
            firstDayOfWeek: 0,
            dayNames: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
            dayNamesShort: ["Sonn", "Mon", "Die", "Mitt", "Donn", "Frei", "Sam"],
            dayNamesMin: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
            monthNames: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
            monthNamesShort: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
            dateFormat: "dd.mm.yy"
        },
        it: {
            firstDayOfWeek: 0,
            dayNames: ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdi", "Sabato"],
            dayNamesShort: ["Dom", "Lun", "Mar", "Mer", "Giov", "Ven", "Sab"],
            dayNamesMin: ["Do", "Lu", "Ma", "Me", "Gi", "Ve", "Sa"],
            monthNames: ["Gennaio", "Febraio", "Marzo", "Aprile", "Maggio", "Giugnio", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
            monthNamesShort: ["Gen", "Feb", "Mar", "Apr", "Mag", "Gui", "Lul", "Ago", "Set", "Ott", "Nov", "Dic"],
            dateFormat: "dd.mm.yy"
        }
    }

    default_locale = this.locales.de

    useLocale = null
    useDateFormat = null
    useModelDateFormat = null
    useDateFormatMomentJS = null
    useModelDateFormatMomentJS = null
    usePrimeNGFormat = null


    dateValueConverter = null

    minDate
    maxDate

    @ViewChild('dateCalenderElement') dateCalenderElement: ElementRef

    constructor(private bindingRegistry: BindingRegistry
        , private renderer: Renderer2
        , private elRef: ElementRef
    ) {
        super()
    }

    /**
     * Do autocomplete separator characters
     */
    dateInput(eventType: string, event: any) {
        if (false !== this.formProperty.schema.widget.formatFilter) {
            inputDateAutoComplete(event.target, this.formProperty, this.dateValueConverter.getSourceFormat())
        }
        if (eventType === 'dateChange') {
            if (event instanceof Date || event.value instanceof Date) {
            }
            const _target = this.dateCalenderElement['el'].nativeElement.querySelector(`#${escapeForCSSId(this.id)}`)
            _target.value = this.formProperty.value
            const _event = { srcElement: _target, target: _target }
            triggerBinding(this, 'change', _event, this.bindingRegistry, this.formProperty)
        }
    }

    ngOnInit() {
        /**
         * setup all date formats
         */
        this.resolveLocale(this.schema.widget.locale || null)
        this.resolveDateFormat(this.schema.widget.locale || null)
        this.useModelDateFormat = this.resolveModelDateFormat() || this.useDateFormat;
        this.resolveConversionDateFormat()
        this.preparePrimeNGFormat(this.useDateFormat)

        if (this.useModelDateFormatMomentJS)
            this.dateValueConverter = new DateValueConverter(this.useDateFormatMomentJS, this.useModelDateFormatMomentJS)
    }

    ngAfterViewInit() {
        const enableDataConversion = null != this.dateValueConverter
        const control = this.control;
        this.formProperty.valueChanges.subscribe((newValue) => {
            if (control.value !== newValue) {
                if (!enableDataConversion || null === newValue) {
                    control.setValue(newValue, { emitEvent: false });
                } else {
                    try {
                        const convertedValue = this.dateValueConverter.revert(newValue)
                        if (convertedValue)
                            control.setValue(convertedValue, { emitEvent: false });
                    } catch (e) {
                        console.error(e)
                        control.setValue('', { emitEvent: false });
                    }
                }
            }
        });
        this.formProperty.errorsChanges.subscribe((errors) => {
            control.setErrors(errors, { emitEvent: true });
            const messages = (errors || [])
                .filter(e => {
                    return e.path && e.path.slice(1) === this.formProperty.path;
                })
                .map(e => e.message);
            this.errorMessages = messages.filter((m, i) => messages.indexOf(m) === i);
        });
        control.valueChanges.subscribe((newValue) => {
            if (!enableDataConversion || newValue === null) {
                // don't set null values in form-property
                this.formProperty.setValue(newValue || '', false);
            } else {
                try {
                    const convertedValue = this.dateValueConverter.transform(newValue)
                    if (convertedValue)
                        this.formProperty.setValue(convertedValue, false);
                } catch (e) {
                    console.error(e)
                    this.formProperty.setValue('', false)
                }
            }
        });

        this.minDate = this.getMinDate()
        this.maxDate = this.getMaxDate()

        this.setupPresetValue()

        this.setMissingAriaAttributes()

        if (false !== this.formProperty.schema.widget.formatFilter) {
            setDateInputEditListener(this.elRef.nativeElement.querySelector('.ui-calendar input'))
        }
        this.initYearMonthNavigator()
    }

    initYearMonthNavigator() {
        /**
         * Fix: When activating year navigator
         * the internal current year will allways be set to 
         * the actual current year.
         * 
         * This will cause jumping the year from the min year of a given year-range 
         * to the current date year when using the month arrows to navigate through the month/years.
         * 
         * PrimeNg Calendar widget does increment the year when the final month (december) is arrived,
         * but not starting from the year currently selected in the dropdown but 
         * from the year of the internal date, which is the actual current date.
         */
        const setCurrentYearFromMinDate = () => {
            this.dateCalenderElement['currentYear'] = null
            this.dateCalenderElement['currentMonth'] = null
            let __date
            if (this.minDate) {
                __date = this.minDate
            } else {
                const date_yearRange = this.schema.widget.yearRange || this.defaultYearRange()
                __date = new Date()
                __date.setFullYear(date_yearRange.split(':')[0])
                __date.setMonth(0)
                __date.setDate(1)
            }
            this.dateCalenderElement['currentYear'] = __date.getFullYear()
            this.dateCalenderElement['currentMonth'] = __date.getMonth()
            this.dateCalenderElement['defaultDate'] = __date
            this.dateCalenderElement['ngOnInit']()
        }
        if (true === this.schema.widget.yearNavigator)
            setCurrentYearFromMinDate()

        /**
         * Fix: 
         * the year navigator not counting properly when selecting the last available year form year dropdown.
         * selecting the last available year from calendar and 
         * navigating via month navigation will cause
         * a re-creation of the month resulting in a non predictable list of month.
         * this fix prevents from navigating outside the given year range
         * by hiding the navigation arrows
         */
        const wrapDateNavigation = () => {
            if (!this.dateCalenderElement['__backup_navForward']) {
                const __backup_navForward = this.dateCalenderElement['navForward']
                const __backup_navBackward = this.dateCalenderElement['navBackward']

                this.dateCalenderElement['__backup_navForward'] = __backup_navForward
                this.dateCalenderElement['__backup_navBackward'] = __backup_navBackward

                const toggleClickable = (boolPrevOrNext, enable) => {
                    const el = boolPrevOrNext ?
                        this.dateCalenderElement['el'].nativeElement.querySelector('.ui-datepicker-prev')
                        : this.dateCalenderElement['el'].nativeElement.querySelector('.ui-datepicker-next')
                    if (el)
                        if (enable) {
                            this.renderer.setStyle(el, 'display', 'unset')
                            this.renderer.removeAttribute(el, 'aria-hidden')
                        } else {
                            this.renderer.setStyle(el, 'display', 'none')
                            this.renderer.setAttribute(el, 'aria-hidden', 'true')
                        }
                    if (enable) {
                        if (boolPrevOrNext) {
                            this.renderer.removeClass(this.dateCalenderElement['el'].nativeElement, '__cal_hideNavPrev')
                        } else {
                            this.renderer.removeClass(this.dateCalenderElement['el'].nativeElement, '__cal_hideNavNext')
                        }
                    } else {
                        if (boolPrevOrNext) {
                            this.renderer.addClass(this.dateCalenderElement['el'].nativeElement, '__cal_hideNavPrev')
                        } else {
                            this.renderer.addClass(this.dateCalenderElement['el'].nativeElement, '__cal_hideNavNext')
                        }
                    }
                    return el
                }

                const checkDateNavigation = (prevOrNext, beforeOrAfter) => {
                    const currYear = this.dateCalenderElement['currentYear']
                    const currMonth = this.dateCalenderElement['currentMonth']
                    const date_yearRange = (this.schema.widget.yearRange || this.defaultYearRange()).split(':')

                    let date_yearToTest
                    let monthToTest
                    let year_range_inside
                    let month_in_range
                    if (prevOrNext) {
                        date_yearToTest = date_yearRange[0]
                        monthToTest = beforeOrAfter ? 0 : 1
                        year_range_inside = currYear > date_yearToTest
                        month_in_range = currMonth > monthToTest
                    } else {
                        date_yearToTest = date_yearRange[1]
                        monthToTest = beforeOrAfter ? 11 : 10
                        year_range_inside = currYear < date_yearToTest
                        month_in_range = currMonth < monthToTest
                    }

                    const year_range_limit = currYear == date_yearToTest
                    const year_in_range = year_range_limit || year_range_inside
                    const enable_navigation = (year_range_limit && month_in_range) || year_range_inside
                    return enable_navigation
                }

                const checkDateNavigationFW = (beforeOrAfter) => { return checkDateNavigation(false, beforeOrAfter) }

                const checkDateNavigationBW = (beforeOrAfter) => { return checkDateNavigation(true, beforeOrAfter) }

                const toggleNavigation = () => {
                    if (checkDateNavigationFW(true)) {
                        toggleClickable(false, true)
                    } else {
                        toggleClickable(false, false)
                    }
                    if (checkDateNavigationBW(true)) {
                        toggleClickable(true, true)
                    } else {
                        toggleClickable(true, false)
                    }
                }
                this.dateCalenderElement['navForward'] = (event) => {
                    if (checkDateNavigationFW(true)) {
                        this.dateCalenderElement['__backup_navForward'](event)
                    }
                    toggleNavigation()
                }
                this.dateCalenderElement['navBackward'] = (event) => {
                    if (checkDateNavigationBW(true)) {
                        this.dateCalenderElement['__backup_navBackward'](event)
                    }
                    toggleNavigation()
                }

                const ui_datepicker_year = this.dateCalenderElement['el'].nativeElement.querySelector('select.ui-datepicker-year')
                if (ui_datepicker_year) {
                    ui_datepicker_year.addEventListener('change', (event) => { toggleNavigation() })
                }


                if (!this.dateCalenderElement['__backup_onYearDropdownChange']) {
                    this.dateCalenderElement['__backup_onYearDropdownChange'] = this.dateCalenderElement['onYearDropdownChange']
                    this.dateCalenderElement['onYearDropdownChange'] = (event_target_value) => {
                        this.dateCalenderElement['__backup_onYearDropdownChange'](event_target_value)
                        // on year select check if navigation buttons should be enabled
                        toggleNavigation()
                    }
                }

                if (!this.dateCalenderElement['__backup_updateUI']) {
                    this.dateCalenderElement['__backup_updateUI'] = this.dateCalenderElement['updateUI']
                    this.dateCalenderElement['updateUI'] = () => {
                        this.dateCalenderElement['__backup_updateUI']()
                        // initally check if navigation buttons should be enabled
                        toggleNavigation()
                    }
                }
            }
        }
        wrapDateNavigation()
    }

    setMissingAriaAttributes() {
        const button = (this.dateCalenderElement.nativeElement || this.dateCalenderElement['el'].nativeElement).querySelector('button.ui-calendar-button')
        if (button) {
            if (!this.schema.widget.iconDescription) {
                this.renderer.setAttribute(button, 'aria-hidden', 'true')
                this.renderer.setAttribute(button, 'tabindex', '-1')
            }
            const val = this.schema.widget.iconDescription || 'Open calendar'
            this.renderer.setAttribute(button, 'aria-label', val)
            this.renderer.setAttribute(button, 'title', val)
            this.renderer.setAttribute(button, 'aria-haspopup', 'dialog')
        }
    }
    setupPresetValue() {
        if (this.schema.widget['preset']) {
            const newDate = this.getDateFromAge(this.schema.widget['preset'])
            if (newDate) {
                const enableDataConversion = null != this.dateValueConverter
                const newValue = DateValueConverter.dateToString(newDate, this.useDateFormatMomentJS)
                if (!enableDataConversion || newValue === null) {
                    // don't set null values in form-property
                    this.formProperty.setValue(newValue || '', false)
                } else {
                    try {
                        const convertedValue = this.dateValueConverter.transform(newValue)
                        if (convertedValue)
                            this.formProperty.setValue(convertedValue, false)
                    } catch (e) {
                        console.error(e)
                        this.formProperty.setValue('', false)
                    }
                }
            }
        }
    }

    preparePrimeNGFormat(format: string) {
        if (null != this.usePrimeNGFormat)
            return this.usePrimeNGFormat
        if (format)
            return DateFormatHelper.convertToFormatPrimeNG(format)
        return null
    }

    getInputType() {
        if (!this.schema.widget.id || this.schema.widget.id === 'string') {
            return 'text';
        } else {
            return this.schema.widget.id;
        }
    }

    resolveConversionDateFormat() {
        if (this.useDateFormat && this.useModelDateFormat) {
            if (this.useDateFormat)
                this.useDateFormatMomentJS = DateFormatHelper.convertToFormatMomentJS(this.useDateFormat)
            if (this.useModelDateFormat)
                this.useModelDateFormatMomentJS = DateFormatHelper.convertToFormatMomentJS(this.useModelDateFormat)
        }
    }

    resolveDateFormat(locale) {
        if (null != this.useDateFormat)
            return this.useDateFormat

        if (this.schema.widget['dateFormat'])
            return this.useDateFormat = this.schema.widget.dateFormat

        let _locale = this.resolveLocale(locale)
        if (_locale) {
            return this.useDateFormat = _locale.dateFormat
        }
    }

    resolveModelDateFormat() {
        if (null != this.useModelDateFormat)
            return this.useModelDateFormat

        if (this.schema.widget['modelDateFormat'])
            return this.useModelDateFormat = this.schema.widget.modelDateFormat
    }

    resolveLocale(locale) {
        if (null != this.useLocale)
            return this.useLocale

        let _locale = this.default_locale
        if (locale) {
            try {
                if ('string' === (typeof locale)) {
                    _locale = this.locales[locale] || this.default_locale
                }
            } catch (e) {
                console.error('DateWidgetComponent resolveLocale', e, this)
            }
            if ('string' !== (typeof locale)) {
                _locale = locale
            }
        }
        /**
         * PrimeNG requires lowercase date format
         */
        if (_locale.dateFormat) {
            _locale.dateFormat = DateFormatHelper.convertToFormatPrimeNG(_locale.dateFormat)
        }

        return this.useLocale = _locale
    }

    isBoolean(value) {
        return 'boolean' === typeof value
    }

    showOnFocus() {
        return (this.schema.widget.hasOwnProperty('showOnFocus') && this.isBoolean(this.schema.widget.showOnFocus))
            ? this.schema.widget.showOnFocus
            : null
    }

    /**
     * Current date year + 20 years
     * @returns {string}
     */
    defaultYearRange() {
        if (true === this.schema.widget['yearNavigator']) {
            const n = new Date()
            const minDate = this.getMinDate()
            const maxDate = this.getMaxDate()
            const minYear = minDate ? minDate.getFullYear() : n.getFullYear()
            const maxYear = maxDate ? maxDate.getFullYear() : (n.getFullYear() + 20)
            return `${minYear}:${maxYear}`
        }
        return null
    }

    _convertToDate(value): Date {
        let date: any = value
        if (date) {
            if (!(date instanceof Date)) {
                date = new Date(date.toString())
            }

        } else {
            date = null
        }
        return date
    }
    /*
    DON'T call this methods from then template like <code>[minDate]="getMinDate()"</code>
    this will cause re-drawing the calendar periodically.
    This behaviour then will suddenly close the select element of the year navigator if any.
     */
    getMinDate() {
        return this.getMinDateFromMinAge() || this._convertToDate(this.schema.widget['minDate']) || null
    }
    /*
    DON'T call this methods from the template like <code>[maxDate]="getMaxDate()"</code>
    this will cause re-drawing the calendar periodically.
    This behaviour then will suddenly close the select element of the year navigator if any.
     */
    getMaxDate() {
        return this.getMaxDateFromMaxAge() || this._convertToDate(this.schema.widget['maxDate']) || null
    }

    getDateFromAge(ageString: string): Date {
        let date: Date = null
        if (ageString) {
            const ageStringParts = ageString.split(':')
            if (ageStringParts[0]) {
                const year = parseInt(ageStringParts[0])
                if (!isNaN(year)) {
                    date = date || new Date()
                    date.setFullYear(date.getFullYear() + year)
                }
            }
            if (ageStringParts[1]) {
                const month = parseInt(ageStringParts[1])
                if (!isNaN(month)) {
                    date = date || new Date()
                    date.setMonth(date.getMonth() + month)
                }
            }
            if (ageStringParts[2]) {
                const day = parseInt(ageStringParts[2])
                if (!isNaN(day)) {
                    date = date || new Date()
                    date.setDate(date.getDate() + day)
                }
            }
        }
        return date
    }

    getMinDateFromMinAge(): Date {
        return this.getDateFromAge(this.schema.widget['minAge'])
    }

    getMaxDateFromMaxAge() {
        return this.getDateFromAge(this.schema.widget['maxAge'])
    }

}
