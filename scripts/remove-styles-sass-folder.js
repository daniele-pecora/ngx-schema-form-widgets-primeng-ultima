const fileUtils = require('./fileutils')
const fs = require('fs')
const path = require('path')
const p = './dist'
let files = fs.readdirSync(p)
console.log('***Removing unused styles')
files.forEach((file) => {
    if(fs.statSync(path.join(p, file)).isDirectory()) {
        fileUtils.rmdir(path.join(p, file)+path.normalize('/assets/sass'))
    }
})