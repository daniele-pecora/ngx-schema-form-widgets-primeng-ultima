const fileUtils = require('./fileutils')
console.log('***Removing SCSS files')
const files = fileUtils.searchForFilesByType('./dist', ['scss'])
if(Array.isArray(files) && files.length > 0) {
    files.forEach((file) => {
        fileUtils.removeFile(file)
    })
}
