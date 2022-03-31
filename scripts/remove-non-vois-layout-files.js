const fileUtils = require('./fileutils')
const path = require('path')
const p = './dist'
const dir = path.normalize('/assets/layout/css')
console.log('***Removing non vois layout files')
let files = fileUtils.searchForFilesByType(p, ['css'])
if(Array.isArray(files) && files.length > 0) {
    files.forEach((file) => {
        if(file.includes(dir) && !file.match(new RegExp('.*\-vois\.css'))) {
            fileUtils.removeFile(file)
        }  
    })
}