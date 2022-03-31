const fileUtils = require('./fileutils')
const fs = require('fs')
const path = require('path')
const p = './dist'
let files = fs.readdirSync(p)
console.log('***Removing unused styles')
files.forEach((file) => {
    if(fs.statSync(path.join(p, file)).isDirectory()) {
        fileUtils.rmdir(path.join(p, file)+path.normalize('/assets/layout-images'))
    }
})




//Verbesserungen:
//fileUtils.rmdir umbauen, sodass man auf wildcards in urls reagieren kann.
//Anstelle remove-styles-sass-folder und remove-unsued-image-files nur einen script remove-files.js erstellen und argumente an ihn mit dem Path übergeben.
//z.B.: "my-script-in-der-packagejson": "node scripts/remove-files.js -- /dist/*/assets/sass" 