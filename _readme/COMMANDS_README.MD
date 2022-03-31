## NPM Commands

Here is the complete list of the generated `npm run` commands

_Some of this commands may not be installed yet._
_Type `nucli -h` in terminal to get help about that._

## Serve with HTTPS
Start the server with HTTPS as the default

```bash
	$ npm start
```
## SASS start watcher
This will start a watcher to detect changes in `scss` files in directory `assets`
and re-compile them if necessary

```bash
	$ npm run styles:watch
```
## SASS compile
This will start compiling `scss` files in directory `assets`
 and creates `css` files.

```bash
	$ npm run styles:build
```
## Production build
Creates a production with AOT and build optimizer support

```bash
	$ npm run build:prod
```
## Electron desktop client generation
Builds the app and starts the electron desktop client in production mode.


The client configuration file `electron-package.json`
and the client start script `electron-main.js`
are location in the project root directory.


See also [Electron Homepage](https://electron.atom.io/)

```bash
	$ npm run electron:run
```
## Electron desktop client start
Opens and existing build of the app located in the projects `dist/ngx-schema-form-widgets-primeng-ultima-app` directory.


The client configuration file `electron-package.json`
and the client start script `electron-main.js`
are located in the project root directory.


See also [Electron Homepage](https://electron.atom.io/)

```bash
	$ npm run electron:open
```
## Electron desktop client packaging
Create and package a desktop client for a specific OS
containing the app located in the projects `dist/ngx-schema-form-widgets-primeng-ultima-app` directory.


`windows` for Windows 32
`darwin` for MAC
`linux` for Linux


See also [Electron Packager on Git](https://github.com/electron-userland/electron-packager)

```bash
	$ npm run electron:windows
	$ npm run electron:darwin
	$ npm run electron:linux
```
## Electron packager help
The help command for npm module electron:packager.
Prints the list of all programm arguments to the terminal.


See also [electron:packager Homepage](https://github.com/electron/electron-packager/)

```bash
	$ npm run electron:help
```
## Bundle analyzer report generation
Creates a new production build with statistic information for the bundle space usage report
and opens the bundle analyzer report as an html page in browser

See also [webpack-bundle-analyzer on Github](https://github.com/th0r/webpack-bundle-analyzer)

```bash
	$ npm run bundle-report
```
## Bundle analyzer report show
Opens the bundle analyzer report as an html page in browser

See also [webpack-bundle-analyzer on Github](https://github.com/th0r/webpack-bundle-analyzer)

```bash
	$ npm run bundle-report:open
```
## Documentation generation
Creates the js files documentation with typedoc

See also [Typedoc Homepage](http://typedoc.org/guides/usage/)

```bash
	$ npm run doc
```
## Generate Service-Worker Pre-Cache
Create a pre-cache file for listing all files that should be cached by the service-worker

See also:
 - [sw-precache](https://www.npmjs.com/package/sw-precache)
 - [How to Angular Service-Worker](https://coryrylan.com/blog/fast-offline-angular-apps-with-service-workers)
 - [How to Progressive Angular Applications](https://houssein.me/progressive-angular-applications)

```bash
	$ npm run precache
```
## Clean up layout files
Remove any unnecessary image or style (css, scss) file from `dist` directory
This command may be called after `build:prod` command
If you use `yarn` as package manager, replace `npm` with `yarn`

```bash
	$ npm run build:prod && npm run cleanup-layout-default
```
## Clean up to VOIS layout
Remove any not VOIS related image or style (css, scss) file from `dist` directory
This command may be called after `build:prod` command
If you use `yarn` as package manager, replace `npm` with `yarn`

```bash
	$ npm run build:prod && npm run cleanup-layout-vois
```
## A production optimized run script
This command simply puts all commands together to get the project ready for production
The distribution files will be located in the projects distribution folder `dist/ngx-schema-form-widgets-primeng-ultima-app`

```bash
	$ npm run build:prod-server
```
## Update version in manifest.json
Copy the version of the package.json to manifest.json.
This should be run on every production build.

```bash
	$ npm run update:manifest.json
```
