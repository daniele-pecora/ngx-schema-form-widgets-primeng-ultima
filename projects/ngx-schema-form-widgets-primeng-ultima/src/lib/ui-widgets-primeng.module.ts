import { ModuleWithProviders, NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { CaptchaWidgetComponent } from './widgets/captcha/captcha.widget'
import { CheckboxWidgetComponent } from './widgets/checkbox/checkbox.widget'
import { DateWidgetComponent } from './widgets/date/date.widget'
import { IntegerWidgetComponent } from './widgets/integer/integer.widget'
import { ObjectWidgetComponent } from './widgets/object/object.widget'
import { FormWidgetComponent } from './widgets/form/form.widget'
import { SelectWidgetComponent } from './widgets/select/select.widget'
import { StringWidgetComponent } from './widgets/string/string.widget'
import { SwitchWidgetComponent } from './widgets/switch/switch.widget'
import { TextAreaWidgetComponent } from './widgets/textarea/textarea.widget'
import { WizardWidgetComponent } from './widgets/wizard/wizard.widget'
import { ButtonWidgetComponent } from './widgets/button/button.widget'
import { AutoCompleteWidgetComponent } from './widgets/autocomplete/autocomplete.widget'
import { RadioWidgetComponent } from './widgets/radio/radio.widget'
import { RangeWidgetComponent } from './widgets/range/range.widget'
import { ArrayWidgetComponent } from './widgets/array/array.widget'
import { ValidationMessagesComponent } from './widgets/_validation-messages/_validation-messages.component'
import { ValidationFieldMessagesComponent } from './widgets/_validation-field-messages/_validation-field-messages.component'
import { HtmlWidgetComponent } from './widgets/html/html.widget'
import { BbcodeWidgetComponent } from './widgets/bbcode/bbcode.widget'
import { QrcodeWidgetComponent } from './widgets/qrcode/qrcode.widget'
import { MessageWidgetComponent } from './widgets/message/message.widget'
import { MessagesWidgetComponent } from './widgets/messages/messages.widget'
import { WidgetLinkComponent } from './widgets/_widget-link/widget-link.component'
import { WidgetAddonComponent } from './widgets/_widget-addon/widget-addon.component'
import { WidgetTitleComponent } from './widgets/_widget-title/widget-title.component'
import { OsmViewComponent } from './widgets/_osm/osm-view.component'
import { OSMWidgetComponent } from './widgets/osm/osm.widget'
import { SectionWidgetComponent } from './widgets/section/section.widget'
import { SelectButtonWidgetComponent } from './widgets/select-button/select-button.widget'
import { ProgressWidgetComponent } from './widgets/progress/progress.widget'
import { DialogWidgetComponent } from './widgets/dialog/dialog.widget'

import { ByteSizeFormatPipe, FileWidgetComponent } from './widgets/file/file.widget'
import { IsFormPropertyRequiredAsteriskPipe, IsFormPropertyRequiredPipe, IsFormPropertyRequiredAttributePipe, IsFormPropertyRequiredAttributeStringPipe, RequiredMarkComponent } from './widgets/_pipe/IsRequiredField'
import { IconNameTransformerService } from './widgets/_converters/_icon/icon-name-transformer.service'
import { IconNameTransformerPrimengUltimaService } from './widgets/_converters/_icon/icon-name-transformer-primeng-ultima.service'
import { IconNameConverterPipe } from './widgets/_converters/_icon/IconNames'

import { SeverityNameTransformerPrimengUltimaService } from './widgets/_converters/_severity/severity-name-transformer-primeng-ultima.service'
import { SeverityNameTransformerService } from './widgets/_converters/_severity/severity-name-transformer.service'
import { SeverityNameConverterPipe } from './widgets/_converters/_severity/SeverityNames'

import { ButtonTypeConverterPipe } from './widgets/_converters/_button/ButtonTypes';
import { ButtonTypeTransformerService } from './widgets/_converters/_button/button-type-transformer.service';
import { ButtonTypeTransformerPrimengUltimaService } from './widgets/_converters/_button/button-type-transformer-primeng-ultima.service';

import { WidgetComponentApiService } from './widgets/_service/api.service'
import { WidgetComponentHttpApiService } from './widgets/_service/widget-component-http-api.service'
import { WidgetRegistryPrimeNG } from './widgets/widget-registry-primeng'

import { SelectCardWidgetComponent } from './widgets/select-card/select-card.widget'

import { SchemaFormModule, SchemaValidatorFactory, WidgetRegistry } from 'ngx-schema-form'
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode'
import { FixOptionalEmptyFieldsZSchemaValidatorFactory } from './fix-optional-empty-fields-z-schema-validator-factory'
import { MessageModule } from 'primeng/message'
import { InputTextModule } from 'primeng/inputtext'
import { InputTextareaModule } from 'primeng/inputtextarea'
import { InputSwitchModule } from 'primeng/inputswitch'
import { CheckboxModule } from 'primeng/checkbox'
import { CalendarModule } from 'primeng/calendar'
import { InputMaskModule } from 'primeng/inputmask'
import { CaptchaModule } from 'primeng/captcha'
import { DropdownModule } from 'primeng/dropdown'
import { SpinnerModule } from 'primeng/spinner'
import { SliderModule } from 'primeng/slider'
import { StepsModule } from 'primeng/steps'
import { AutoCompleteModule } from 'primeng/autocomplete'
import { FileUploadModule } from 'primeng/fileupload'
import { RadioButtonModule } from 'primeng/radiobutton'
import { TooltipModule } from 'primeng/tooltip'
import { TabViewModule } from 'primeng/tabview'
import { MessagesModule } from 'primeng/messages'
import { AccordionModule } from 'primeng/accordion'
import { KeyFilterModule } from 'primeng/keyfilter'
import { DialogModule } from 'primeng/dialog'
import { SelectButtonModule } from 'primeng/selectbutton'
import { ProgressSpinnerModule } from 'primeng/progressspinner'
import { ProgressBarModule } from 'primeng/progressbar'
import { TableModule } from 'primeng/table'

import { HttpClientModule } from '@angular/common/http'

import { AngularOpenlayersModule } from 'ngx-openlayers'
import { TableWidgetComponent } from './widgets/table/table.widget'
import { DataConverterRegistryPipe } from './widgets/_converters/_data/data-converter-registry.pipe'

import { ExpressionCompiler, JEXLExpressionCompiler } from './widgets/_service/expression-complier.service'
import { DialogFormElementComponent } from './widgets/dialog/dialog-form.component';
import { NgxRecaptchaModule } from 'ngx-recaptcha-easy'

const moduleProviders = [
  { provide: WidgetRegistry, useClass: WidgetRegistryPrimeNG },
  /**
   This is how you would use a custom schema validator factory
   */
  { provide: SchemaValidatorFactory, useClass: FixOptionalEmptyFieldsZSchemaValidatorFactory }
]


@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule,
    HttpClientModule,
    // ngx-schema-form
    SchemaFormModule,
    // PrimeNG
    InputTextModule,
    InputTextareaModule,
    InputSwitchModule,
    CheckboxModule,
    CalendarModule,
    InputMaskModule,
    CaptchaModule,
    DropdownModule,
    SpinnerModule,
    SliderModule,
    StepsModule,
    AutoCompleteModule,
    FileUploadModule,
    RadioButtonModule,
    SliderModule,
    TooltipModule,
    MessageModule,
    MessagesModule,
    TabViewModule,
    KeyFilterModule,
    NgxQRCodeModule,
    DialogModule,
    AccordionModule,
    SelectButtonModule,
    ProgressSpinnerModule,
    ProgressBarModule,
    TableModule,
    // OSM
    AngularOpenlayersModule,
    // ngx-recaptcha
    NgxRecaptchaModule
  ],
  declarations: [
    ArrayWidgetComponent,
    AutoCompleteWidgetComponent,
    ButtonWidgetComponent,
    CaptchaWidgetComponent,
    CheckboxWidgetComponent,
    DateWidgetComponent,
    FileWidgetComponent,
    FormWidgetComponent,
    IntegerWidgetComponent,
    ObjectWidgetComponent,
    RadioWidgetComponent,
    RangeWidgetComponent,
    SelectWidgetComponent,
    StringWidgetComponent,
    SwitchWidgetComponent,
    TextAreaWidgetComponent,
    WizardWidgetComponent,
    ValidationMessagesComponent,
    ValidationFieldMessagesComponent,
    HtmlWidgetComponent,
    BbcodeWidgetComponent,
    ByteSizeFormatPipe,
    IsFormPropertyRequiredAsteriskPipe,
    IsFormPropertyRequiredPipe,
    IsFormPropertyRequiredAttributePipe,
    IsFormPropertyRequiredAttributeStringPipe,
    RequiredMarkComponent,
    IconNameConverterPipe,
    SeverityNameConverterPipe,
    ButtonTypeConverterPipe,
    QrcodeWidgetComponent,
    MessageWidgetComponent,
    MessagesWidgetComponent,
    WidgetLinkComponent,
    WidgetAddonComponent,
    WidgetTitleComponent,
    OsmViewComponent,
    OSMWidgetComponent,
    SectionWidgetComponent,
    SelectButtonWidgetComponent,
    SelectCardWidgetComponent,
    DialogWidgetComponent,
    ProgressWidgetComponent,
    TableWidgetComponent,
    DataConverterRegistryPipe,

    DialogFormElementComponent
  ],
  entryComponents: [
    ArrayWidgetComponent,
    AutoCompleteWidgetComponent,
    ButtonWidgetComponent,
    CaptchaWidgetComponent,
    CheckboxWidgetComponent,
    DateWidgetComponent,
    FileWidgetComponent,
    FormWidgetComponent,
    IntegerWidgetComponent,
    ObjectWidgetComponent,
    RadioWidgetComponent,
    RangeWidgetComponent,
    SelectWidgetComponent,
    StringWidgetComponent,
    SwitchWidgetComponent,
    TextAreaWidgetComponent,
    WizardWidgetComponent,
    ValidationMessagesComponent,
    ValidationFieldMessagesComponent,
    HtmlWidgetComponent,
    BbcodeWidgetComponent,
    QrcodeWidgetComponent,
    MessageWidgetComponent,
    MessagesWidgetComponent,
    WidgetLinkComponent,
    WidgetAddonComponent,
    WidgetTitleComponent,
    OsmViewComponent,
    OSMWidgetComponent,
    SectionWidgetComponent,
    SelectButtonWidgetComponent,
    SelectCardWidgetComponent,
    DialogWidgetComponent,
    ProgressWidgetComponent,
    TableWidgetComponent,

    DialogFormElementComponent
    
  ],
  exports: [
    ArrayWidgetComponent,
    AutoCompleteWidgetComponent,
    ButtonWidgetComponent,
    CaptchaWidgetComponent,
    CheckboxWidgetComponent,
    DateWidgetComponent,
    FileWidgetComponent,
    FormWidgetComponent,
    IntegerWidgetComponent,
    ObjectWidgetComponent,
    RadioWidgetComponent,
    RangeWidgetComponent,
    SelectWidgetComponent,
    StringWidgetComponent,
    SwitchWidgetComponent,
    TextAreaWidgetComponent,
    WizardWidgetComponent,
    ValidationMessagesComponent,
    ValidationFieldMessagesComponent,
    HtmlWidgetComponent,
    BbcodeWidgetComponent,
    ByteSizeFormatPipe,
    IsFormPropertyRequiredAsteriskPipe,
    IsFormPropertyRequiredPipe,
    IsFormPropertyRequiredAttributePipe,
    IsFormPropertyRequiredAttributeStringPipe,
    RequiredMarkComponent,
    IconNameConverterPipe,
    SeverityNameConverterPipe,
    ButtonTypeConverterPipe,
    QrcodeWidgetComponent,
    MessageWidgetComponent,
    MessagesWidgetComponent,
    WidgetLinkComponent,
    WidgetAddonComponent,
    WidgetTitleComponent,
    OsmViewComponent,
    OSMWidgetComponent,
    SectionWidgetComponent,
    ProgressWidgetComponent,
    TableWidgetComponent,
    DataConverterRegistryPipe,
    SelectButtonWidgetComponent,
    SelectCardWidgetComponent,
    DialogWidgetComponent,


    DialogFormElementComponent
  ],
  providers: [WidgetComponentApiService, WidgetComponentHttpApiService,
    {
      provide: IconNameTransformerService,
      useClass: IconNameTransformerPrimengUltimaService
    },
    {
      provide: SeverityNameTransformerService,
      useClass: SeverityNameTransformerPrimengUltimaService
    },
    {
      provide: ButtonTypeTransformerService,
      useClass: ButtonTypeTransformerPrimengUltimaService
    },
    {
      provide: ExpressionCompiler,
      useClass: JEXLExpressionCompiler
    }
  ]
})
export class UIWidgetsPrimeNGModule {
  static forRoot(): ModuleWithProviders<UIWidgetsPrimeNGModule> {
    return {
      ngModule: UIWidgetsPrimeNGModule,
      providers: [...moduleProviders]
    }
  }
}
