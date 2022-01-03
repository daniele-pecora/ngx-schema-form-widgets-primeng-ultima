/** angular elements */
/**
 * Args: 
 * 
 *  --base-href   : A value for the base-href. Default is './'
 */
var __args = process.argv.slice(2)

let ___base_href = './'
let ___app_name = ''
for (let i = 0; i < __args.length; i++) {
    switch (__args[i]) {
        case '--base-href':
            ___base_href = __args[i + 1]
            i++
            break
        case '--app-name':
            ___app_name = __args[i + 1]
            i++
            break
        case '--help' || '-h':
            console.log(`
            Usage node <script> <args>
            
            Arguments:
                --base-href    : A value for the base-href. Default is './'
                --app-name     : Will be used for defining the TAG name. 
                                 Default is the name of the default-project in angular.json with suffix '-elements'

            `);
            i++
            process.exit()
        default:
            console.log('Sorry, that is not something I know how to do.')
    }
}

const fs = require('fs-extra')
const fileExists = (path) => {
    try {
        if (fs.existsSync(path)) {
            return true
        }
    } catch (err) {
        console.error(err)
    }
    return false
}

console.log('using --base-href:', ___base_href)
if (!fileExists('angular.json')) {
    throw new Error('Not an Angular project. File angular.json not found')
} else {
    if (!___app_name) {
        const _a = JSON.parse(fs.readFileSync('angular.json'))
        ___app_name = (_a.defaultProject || Object.keys(_a.projects)[0]) + '-elements'
    }
}
console.log('using --app-name:', ___app_name)

const appname = ___app_name






/***************************************************************************************************/
/** ng build --tsConfig=tsconfig-elements.json */
/** 
 * creates a tsconfig-elements.json 
 * for creating a webcomponent out of this app
 */
const tsConfFile = 'tsconfig.json'
const tsConfFileElements = 'tsconfig-elements.json'
fs.removeSync(tsConfFileElements)
const tsconfig = JSON.parse(fs.readFileSync(tsConfFile))
tsconfig['compilerOptions']['target'] = 'ES2015'
fs.writeFileSync(tsConfFileElements, JSON.stringify(tsconfig, null, 2))

const angular_json = JSON.parse(fs.readFileSync('angular.json') + '')
const defaultProject = angular_json['defaultProject']
const tsConfigAppPath = angular_json['projects'][defaultProject]['architect']['build']['options']['tsConfig']
const tsConfigAppElementsPath = tsConfigAppPath.replace('.app', '-elements.app')
const tsAppConfFile = tsConfigAppPath
const tsAppConfFileElements = tsConfigAppElementsPath
fs.removeSync(tsAppConfFileElements)
const tsappconfig = JSON.parse(fs.readFileSync(tsAppConfFile))
tsappconfig['extends'] = tsAppConfFile.includes('src') ? '../tsconfig-elements.json' : './tsconfig-elements.json'
const tsexcludes = tsappconfig['exclude'] || []
tsexcludes.push('main.ts')
tsexcludes.push('app/app.module.ts')
tsexcludes.push('app/app-routing.module.ts')
tsexcludes.push('app/app.component.ts')
tsappconfig['exclude'] = tsexcludes
fs.writeFileSync(tsAppConfFileElements, JSON.stringify(tsappconfig, null, 2))


/***************************************************************************************************/

const auto_info = `
/** ******************************** */
/** angular elements */
/** this file is auto generated and might be deleted */
/** don't modify */
/** ******************************** */
`
/** ------------------------------- */
/** polyfills-elements.ts */
/** ------------------------------- */
const tsPolyfills = 'src/polyfills.ts'
const tsPolyfillsTarget = 'src/polyfills-elements.ts'
fs.removeSync(tsPolyfillsTarget)
const tsPolyfillContent = `${auto_info}` + fs.readFileSync(tsPolyfills) + `
/***************************************************************************************************
 * CUSTOM WEBCOMPONENT
 */
import '@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js'  /** angular elements */
`
fs.writeFileSync(tsPolyfillsTarget, tsPolyfillContent)

/** ------------------------------- */
/** app.component-elements.ts */
/** ------------------------------- */
/** trigger router initial navigation */

String.prototype.regexIndexOf = function (regex, startpos) {
    var indexOf = this.substring(startpos || 0).search(regex)
    return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf
}

/**
 * 
 * @param {*} directive `@NgModule`, `@Component`, etc...
 * @param {*} directiveProperty  `providers`, `import`, etc...
 * @param {*} value Any string value
 * @param {*} content The content where to search for the directive
 * @returns The modified content
 */
const addDirectvePropertValue = (directive, directiveProperty, value, contentToModify) => {
    let content = contentToModify
    const _directive_start = content.indexOf(directiveProperty, content.indexOf(directive))
    if (-1 === _directive_start) {
        const _module_directive_body_start = content.indexOf(directive + '({')
        content = content.slice(0, _module_directive_body_start + (`${directive}({`.length)) +
            `${directiveProperty}: [${value}],` +
            content.slice(_module_directive_body_start + (`${directive}({`.length))
    } else {
        const _directive_body_start = content.indexOf('[', _directive_start)
        content = content.slice(0, _directive_body_start + '['.length) + `
        ${value},
    `+ content.slice(_directive_body_start + '['.length)
    }
    return content
}

const app_component_ts = 'src/app/app.component.ts'
const app_component_ts_target = 'src/app/app.component-elements.ts'
fs.removeSync(app_component_ts_target)
let app_component_ts_content = `${auto_info}` + fs.readFileSync(app_component_ts)
let package_json = JSON.parse(fs.readFileSync('package.json') + '')
const hasRouter = package_json['dependencies'].hasOwnProperty('@angular/router')
if(hasRouter) {
    if (-1 === app_component_ts_content.indexOf('@Component')) {
        throw new Error(`File ${app_component_ts} is not a component. Does not contain directive @Component`)
    } else {
        if (-1 === app_component_ts_content.split('@Component')[0].indexOf('OnInit')) {
            // add missing import
            app_component_ts_content = `import {OnInit} from '@angular/core'` + app_component_ts_content
        }
        if (-1 === app_component_ts_content.regexIndexOf(new RegExp('( |,)( )?OnInit', 'ig'), app_component_ts_content.indexOf('@Component'))) {
            // add missing interface implementation
            const _implements_index = app_component_ts_content.indexOf('implements', app_component_ts_content.indexOf('export class AppComponent'))
            if (-1 !== _implements_index) {
                app_component_ts_content = app_component_ts_content.slice(0, _implements_index + ('implements'.length)) + ' OnInit, ' + app_component_ts_content.slice(_implements_index + ('implements'.length))
            } else {
                const _class_body_start = app_component_ts_content.indexOf('{', app_component_ts_content.indexOf('export class AppComponent'))
                app_component_ts_content = app_component_ts_content.slice(0, _class_body_start) + ' implements OnInit ' + app_component_ts_content.slice(_class_body_start)
            }
        } else { }
        if (-1 === app_component_ts_content.indexOf('ngOnInit')) {
            // add missing ngOnInit method
            const _class_body_start = app_component_ts_content.indexOf('{', app_component_ts_content.indexOf('export class AppComponent')) + 1
            const _ngOnInit = `
        ngOnInit(): void {
        }`
            app_component_ts_content = app_component_ts_content.slice(0, _class_body_start) + _ngOnInit + app_component_ts_content.slice(_class_body_start)
        }
        if (-1 === app_component_ts_content.indexOf('this.router.initialNavigation(')) {
            // add missing router initial navigation trigger
            const _router_initialize = `
            this.router.initialNavigation(/** Manually triggering initial navigation for @angular/elements */) /** angular elements */
            if('/'!==window.location.pathname){
                /** If its not the root path the path must be passed to the angular router */
                this.router.navigateByUrl(window.location.href.substr(window.location.href.indexOf(window.location.pathname)))
                /** then remove url from adressbar */
                window.history.pushState({"html":'',"pageTitle":''},"", '/')
            }
            `
            const _method_body_start = app_component_ts_content.indexOf('{', app_component_ts_content.indexOf('ngOnInit')) + 1
            app_component_ts_content = app_component_ts_content.slice(0, _method_body_start) + `${_router_initialize}` + app_component_ts_content.slice(_method_body_start)
        }
        if(-1 === app_component_ts_content.indexOf('@angular/router')) {
            //add missing import
            app_component_ts_content = `import {Router} from '@angular/router'\n` + app_component_ts_content
            //if constructor is present inject router into constructor, else just create a constructor with router injected.
            if(-1 === app_component_ts_content.indexOf('constructor')) {
                app_component_ts_content = app_component_ts_content.replace('ngOnInit', 'constructor(private router: Router) {}\nngOnInit')
            } else {
                app_component_ts_content = app_component_ts_content.replace(new RegExp('constructor\\s?\\('), 'constructor(private router: Router,')
            }
        }
    
        app_component_ts_content = app_component_ts_content.replace('AppComponent', 'AppComponentElements')
        fs.writeFileSync(app_component_ts_target, app_component_ts_content)
    }
}



/** ------------------------------- */
/**  app.module-elements.ts */
/** ------------------------------- */

const app_module_ts = 'src/app/app.module.ts'
const app_module_ts_target = 'src/app/app.module-elements.ts'
fs.removeSync(app_module_ts_target)
let app_module_ts_content = `${auto_info}` + fs.readFileSync(app_module_ts)

// add necessary imports
app_module_ts_content = `
import { Injector } from '@angular/core'/** angular elements */
import { createCustomElement } from '@angular/elements'  /** angular elements */
import { APP_BASE_HREF } from '@angular/common'  /** angular elements */

import { AppComponentElements } from './app.component-elements' /** angular elements */

` + app_module_ts_content
// de-activate 'bootstrap' in @NgModule directive
app_module_ts_content = app_module_ts_content.replace('bootstrap', '// bootstrap')


const _class_body_start_module = app_module_ts_content.indexOf('{', app_module_ts_content.indexOf('export class AppModule')) + 1
/** TODO maybe later handling already existing constructor or ngDoBootstrap method...but not for now */
app_module_ts_content = app_module_ts_content.slice(0, _class_body_start_module) + `

constructor(private injector: Injector) {/** angular elements */ }
ngDoBootstrap() {/** angular elements */
  const angularElement = createCustomElement(AppComponentElements, {
    injector: this.injector
  })
  customElements.define('${appname}', angularElement)
}
`+ app_module_ts_content.slice(_class_body_start_module)

app_module_ts_content = addDirectvePropertValue('@NgModule', 'providers', `{ provide: APP_BASE_HREF, useValue: '${___base_href || './'}' /** angular elements */ }`, app_module_ts_content)
app_module_ts_content = addDirectvePropertValue('@NgModule', 'entryComponents', `AppComponentElements /** angular elements */`, app_module_ts_content)
app_module_ts_content = addDirectvePropertValue('@NgModule', 'declarations', `AppComponentElements /** angular elements */`, app_module_ts_content)

// rename class
app_module_ts_content = app_module_ts_content.replace('AppModule', 'AppModuleElements')


// remove unused components
app_module_ts_content = app_module_ts_content.replace(new RegExp('(import {)( )*(AppComponent)( )*(})( )*(from.*)', 'g'), '')
app_module_ts_content = app_module_ts_content.replace(new RegExp('( )?(,)?( )?(\\bAppComponent\\b)( )?(,)?', 'g'), '')


fs.writeFileSync(app_module_ts_target, app_module_ts_content)


/** ------------------------------- */
/**  app.routing.module-elements.ts */
/** ------------------------------- */
const app_routing_ts = 'src/app/app-routing.module.ts'
if (fileExists(app_routing_ts)) {
    const app_routing_ts_target = 'src/app/app-routing.module-elements.ts'
    fs.removeSync(app_routing_ts_target)
    let app_routing_ts_content = `${auto_info}` + fs.readFileSync(app_routing_ts)


    // add import
    let _routing_directive_body_start = app_routing_ts_content.indexOf('@NgModule({')
    app_routing_ts_content = app_routing_ts_content.slice(0, _routing_directive_body_start) + `
import { RouterTestingModule } from '@angular/router/testing' /** angular elements */
` + app_routing_ts_content.slice(_routing_directive_body_start)


    /** TODO maybe later handling already existing imports and export...but not for now */
    _routing_directive_body_start = app_routing_ts_content.indexOf('@NgModule({')
    app_routing_ts_content = app_routing_ts_content.slice(0, _routing_directive_body_start + ('@NgModule({'.length)) +
        `
imports: [RouterTestingModule.withRoutes(routes)] /** angular elements */,
exports: [RouterTestingModule]
` +
        app_routing_ts_content.slice(app_routing_ts_content.indexOf('})', _routing_directive_body_start))

    // rename class
    app_routing_ts_content = app_routing_ts_content.replace('AppRoutingModule', 'AppRoutingModuleElements')

    fs.writeFileSync(app_routing_ts_target, app_routing_ts_content)


    // update router module in 'app.module-elements.ts'
    let _app_module_ts_target_content = fs.readFileSync(app_module_ts_target) + ''
    _app_module_ts_target_content = `import {AppRoutingModuleElements} from './app-routing.module-elements'` + _app_module_ts_target_content
    _app_module_ts_target_content = addDirectvePropertValue('@NgModule', 'imports', 'AppRoutingModuleElements', _app_module_ts_target_content)
    // remove unused routing module
    _app_module_ts_target_content = _app_module_ts_target_content.replace(new RegExp('(import {)( )*(AppRoutingModule)( )*(})( )*(from.*)', 'g'), '')
    _app_module_ts_target_content = _app_module_ts_target_content.replace(new RegExp('( )?(,)?( )?(\\bAppRoutingModule\\b)( )?(,)?', 'g'), '')

    fs.writeFileSync(app_module_ts_target, _app_module_ts_target_content)
}

/** ------------------------------- */
/**  main-elements.ts */
/** ------------------------------- */

const main_ts = 'src/main.ts'
const main_ts_target = 'src/main-elements.ts'
fs.removeSync(main_ts_target)
let main_ts_content = `${auto_info}` + fs.readFileSync(main_ts)

main_ts_content = `
import { AppModuleElements } from './app/app.module-elements';
` + main_ts_content
// import { AppModule } from './app/app.module';
main_ts_content = main_ts_content.replace(new RegExp('(import {)( )*(AppModule)( )*(})( )*(from.*)', 'g'), '')
main_ts_content = main_ts_content.replace(new RegExp('\\bAppModule\\b', 'g'), 'AppModuleElements')

fs.writeFileSync(main_ts_target, main_ts_content)


/** ------------------------------- */
/** setup angular.json */
/** ------------------------------- */
angular_json['projects'][`${defaultProject}-elements`] = JSON.parse(JSON.stringify(angular_json['projects'][defaultProject]))

angular_json['projects'][`${defaultProject}-elements`]['architect']['build']['options']['main'] = 'src/main-elements.ts'
angular_json['projects'][`${defaultProject}-elements`]['architect']['build']['options']['tsConfig'] = tsConfigAppElementsPath
angular_json['projects'][`${defaultProject}-elements`]['architect']['build']['options']['polyfills'] = 'src/polyfills-elements.ts'
angular_json['projects'][`${defaultProject}-elements`]['architect']['build']['options']['outputPath'] = angular_json['projects'][`${defaultProject}-elements`]['architect']['build']['options']['outputPath'] + '-elements'

fs.writeFileSync('angular.json', JSON.stringify(angular_json, null, 2))