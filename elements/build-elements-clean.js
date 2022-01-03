/** angular elements */
let appname = ''

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

if (!fileExists('angular.json')) {
  throw new Error('Not an Angular project. File angular.json not found')
} else {
  const _a = JSON.parse(fs.readFileSync('angular.json'))
  appname = (_a.defaultProject || Object.keys(_a.projects)[0]) + '-elements'
}

const angular_json = JSON.parse(fs.readFileSync('angular.json'))
const styles = angular_json['projects'][appname]['architect']['build']['options']['styles'].filter((item) => {
  return -1 === [
    "node_modules/@fullcalendar/core/main.min.css",
    "node_modules/@fullcalendar/daygrid/main.min.css",
    "node_modules/@fullcalendar/timegrid/main.min.css",
    "node_modules/quill/dist/quill.snow.css"
  ].indexOf(item)
})
angular_json['projects'][appname]['architect']['build']['options']['styles'] = styles
const scripts = angular_json['projects'][appname]['architect']['build']['options']['scripts'].filter((item) => {
  return -1 === [
    "node_modules/chart.js/dist/Chart.js",
    "node_modules/@fullcalendar/core/main.js",
    "node_modules/@fullcalendar/daygrid/main.js",
    "node_modules/@fullcalendar/timegrid/main.js",
    "node_modules/@fullcalendar/interaction/main.js",
    "node_modules/quill/dist/quill.js"
  ].indexOf(item)
})
angular_json['projects'][appname]['architect']['build']['options']['scripts'] = scripts

fs.writeFileSync('angular.json', JSON.stringify(angular_json, null, 2))