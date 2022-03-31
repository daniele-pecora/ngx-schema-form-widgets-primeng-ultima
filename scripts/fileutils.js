var fileUtils = (function () {

    var fs = require('fs')
    var path = require('path')
    var endsWith = function (val, suffix) {
        return val.indexOf(suffix, this.length - suffix.length) !== -1;
    }

    var rmdir = function (dir) {
        //if (path.existsSync(dir)) {
        if (fs.existsSync(dir)) {
            var list = fs.readdirSync(dir);
            for (var i = 0; i < list.length; i++) {
                var filename = path.join(dir, list[i]);
                var stat = fs.statSync(filename);

                if (filename == "." || filename == "..") {
                    // pass these files
                } else if (stat.isDirectory()) {
                    // rmdir recursively
                    rmdir(filename);
                } else {
                    // rm filename
                    fs.unlinkSync(filename);
                }
            }
            fs.rmdirSync(dir);
        } else {
            console.warn("warn: " + dir + " not exists");
        }
    }

    var existFile = function (filePath) {
        return fs.existsSync(filePath)
    }

    var isDirectory = function (filePath) {
        if (existFile(filePath)) {
            var current = fs.lstatSync(filePath);
            return current.isDirectory()
        }
        return (utils.endsWith(filePath, '/') || utils.endsWith(filePath, '\\'))
    }

    var removeFile = function (filePath) {
        if (existFile(filePath)) {
            fs.unlinkSync(filePath)
        }
    }

    var remove = function (destPath) {
        if (isDirectory(destPath)) {
            rmdir(destPath)
        } else {
            removeFile(destPath)
        }
    }

    var searchForFilesByType = function (folderPath, types) {
        if (!fs.existsSync(folderPath)){
            console.log("Directory doesn't exist")
            return null
        }
        if(!types || types.length === 0) {
            console.log('No files provided')
            return null
        }
        let results = []
        var files = fs.readdirSync(folderPath);
        files.forEach((file) => {
            file = path.join(folderPath, file)
            let stat = fs.statSync(file)
            if (stat && stat.isDirectory()) { 
                results = results.concat(searchForFilesByType(file, types))
            } else {
                if(types[0] === '*' || types.includes(path.extname(file).replace('.', ''))) {
                    results.push(file)
                }
            }
        })
        return results
    }
    

    return {
        rmdir: rmdir,
        removeFile: removeFile,
        remove: remove,
        isDirectory: isDirectory,
        searchForFilesByType: searchForFilesByType,
    }
}
)()

module.exports = fileUtils
