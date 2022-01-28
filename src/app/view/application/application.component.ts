import { Component, ViewEncapsulation } from '@angular/core';
import { UIFormViewHelper, UIFormViewModel } from 'ngx-schema-form-view';
import { AppFormTemplateService } from '../../app.form-template-loader.service';
import mergeDeep from './../../app.utils';
import { FORM_DIRECTORY, SCHEMA_FORM_TEMPLATE } from '../../app.constants';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SchemaValidatorFactory } from 'ngx-schema-form';

@Component({
  selector: 'app-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ApplicationComponent {

  template = SCHEMA_FORM_TEMPLATE

  /**
   * TODO put into documentation:
   * ATTENTION!
   * when initializing the form with an empty schema json
   * then the buttons will not be rendered again for the
   * very element.
   * so if the new schema json contains buttons,
   * they will not be shown!
   *
   * Therefore we start here with a <code>null</code> inital object.
   */
  // uiInitialFormViewModel: UIFormViewModel = {
  //   schemaObject: {properties: {name: {type: 'string'}}},
  //   formModelObject: {},
  //   modelObject: {},
  //   bindingsObject: {},
  //   actionsObject: {},
  //   validatorsObject: {},
  //   mapperObject: {}
  // };
  uiInitialFormViewModel: UIFormViewModel;
  onChangeFormViewModel: UIFormViewModel;
  finalModelObject: object;

  preferredSize = 10
  preferredSizeSpacer = 2

  constructor(private templateService: AppFormTemplateService, private _http: HttpClient) {
    this.loadFromTemplateUrl(this.template)
  }

  onFormViewLoaded(event: UIFormViewModel) {
    this.onChangeFormViewModel = event
  }

  onModelChanged(event: UIFormViewModel) {
    this.onChangeFormViewModel = event;
    console.log('onModelChanged(event: UIFormViewModel):', event);
    this.finalModelObject = new UIFormViewHelper().createFinalModelObject(event)
  }

  actionTrigger(action) {
    if ('action_1' === action) {
      console.log('this.onChangeFormViewModel.modelObject', this.onChangeFormViewModel.modelObject)
    }
    const schema = mergeDeep((this.onChangeFormViewModel.schemaObject || {}), (this.onChangeFormViewModel.formModelObject || {}));
    if (!schema.widget.service || !schema.widget.service.url) {
      console.error('This form has no service configured in widget property!', event);
      return
    }

    const modelObject = this.onChangeFormViewModel.modelObject
    this.request(schema.widget.service.url, {
      method: schema.widget.service.method,
      headers: schema.widget.service.headers,
      body: modelObject,
      withCredentials: schema.widget.withCredentials
    })
      .subscribe((result) => {
        console.log('**** api call result: ' + schema.widget.service.url, result)
      }, (error) => {
        console.error('**** api call error ' + schema.widget.service.url, error)
      })
  }

  /*
   LOAD Resources
   */
  loadFromTemplateUrl(templateId) {
    this.templateService
      .loadFormTemplate(FORM_DIRECTORY, templateId)
      .subscribe((uIFormViewModel) => {
        this.uiInitialFormViewModel = uIFormViewModel
      })
  }

  updateSize(event: any) {
    const val = 12 - this.preferredSize
    this.preferredSizeSpacer = Math.round(val / 2)
  }

  onChangeSize(event: any) {
    this.preferredSize = event
    this.updateSize(event)
  }

  request(url: string, options?: any): Observable<any> {
    options = options || {}

    options.method = options.method || 'GET'

    let httpHeader = new HttpHeaders(
      {
        'Content-Type': 'application/json'
        , 'Accept': 'application/json'
      });

    if (options.headers) {
      for (let header in options.headers) {
        httpHeader = httpHeader.append(header, options.headers[header])
      }
    }

    options.headers = httpHeader
    options.withCredentials = true

    console.log('*** request', options.method, url, options)
    return this._http.request(options.method, url, options)
      .pipe(
        //map(res => res.json()),
        catchError(err => {
          console.log('err', err)
          return throwError(err);
        }));
  }
}
