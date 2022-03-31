/* tslint:disable:no-unused-variable */

import {TestBed, async} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {AppComponent} from './app.component';
import { AppOfflineService } from './app-offline.service'
import {LOCALE_ID} from '@angular/core';
import {AppErrorHandler} from './app.errorhandler';
import {ErrorHandler} from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppFormTemplateService} from './app.form-template-loader.service';
import {ApplicationComponent} from './view/application/application.component';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {SchemaFormModule, SchemaValidatorFactory, WidgetRegistry} from 'ngx-schema-form';
import {UIFormViewModule} from 'ngx-schema-form-view';
import {
  FixOptionalEmptyFieldsZSchemaValidatorFactory,
  UIWidgetsPrimeNGModule,
  WidgetRegistryPrimeNG
} from 'ngx-schema-form-widgets-primeng-ultima';


describe('AppComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        ApplicationComponent
      ],
      imports: [
        RouterTestingModule,
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
        AppFormTemplateService
      ],
    });
    TestBed.compileComponents();
  });

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
