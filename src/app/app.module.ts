import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { AppOfflineService } from './app-offline.service'
import {LOCALE_ID} from '@angular/core';
import {AppErrorHandler} from './app.errorhandler';
import {ErrorHandler} from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {AppFormTemplateService} from './app.form-template-loader.service';
import {ApplicationComponent} from './view/application/application.component';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {LogLevel, LOG_LEVEL, SchemaFormModule, SchemaValidatorFactory, WidgetRegistry} from 'ngx-schema-form';
import {UIFormViewModule} from 'ngx-schema-form-view';
import {
  FixOptionalEmptyFieldsZSchemaValidatorFactory,
  UIWidgetsPrimeNGModule,
  WidgetRegistryPrimeNG
} from '../../projects/ngx-schema-form-widgets-primeng-ultima/src/lib';
import { ResizeComponent } from './view/resize/resize.component';
import { ThemerComponent } from './view/themer/themer.component';
// TODO change the above to this in production, the above allows hot-reload for development
//} from 'ngx-schema-form-widgets-primeng-ultima';

@NgModule({
  declarations: [
    AppComponent,
    ApplicationComponent,
    ResizeComponent,
    ThemerComponent
  ],
  imports: [ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    BrowserAnimationsModule,
    BrowserModule

    // App
    , FormsModule
    , HttpClientModule

    // Angular2 Schema Form
    , SchemaFormModule.forRoot()
    // ui-form-view-ngxsf
    , UIFormViewModule.forRoot()
    // ui-widgets-ngxsf-primeng.module
    , UIWidgetsPrimeNGModule
  ],
  providers: [AppOfflineService,{provide: LOCALE_ID, useValue: 'de-DE' /**required for the date format pipe*/},
    {
      provide: ErrorHandler,
      useClass: AppErrorHandler
    },
    {provide: WidgetRegistry, useClass: WidgetRegistryPrimeNG},
    {provide: SchemaValidatorFactory, useClass: FixOptionalEmptyFieldsZSchemaValidatorFactory},
    {
      provide: LOG_LEVEL,
      useValue: LogLevel.all
    },
    AppFormTemplateService
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
}
