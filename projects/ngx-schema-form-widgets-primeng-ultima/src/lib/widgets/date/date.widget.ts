/**
 * Created by daniele on 12.07.17.
 */
import { AfterViewInit, Component, OnInit, Renderer2, ViewChild, ElementRef, Inject } from "@angular/core";
import { ControlWidget } from "ngx-schema-form";
import { DateValueConverter } from "./date-value.converter";
import { DateFormatHelper } from './date-format-helper'
import { inputDateAutoComplete, setDateInputEditListener } from './date.autocomplete'
import {BindingRegistry} from 'ngx-schema-form'
import {triggerBinding} from '../bindings-registry-helper'
import { NoHelperTextSpacer } from "../_component-helper/no-helpertext-spacer.widget";
import { escapeForCSSId } from "../_utils/utils";

@Component({
    selector: 'ngx-ui-date-widget',
    templateUrl: './date.widget.html',
    styleUrls: ['../_component-helper/no-helpertext-spacer.widget.scss']
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
        ){
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
