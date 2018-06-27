app.service('filesystem', function () {
    const fs = require('fs');
    const path = require('path');
    const { dialog } = require('electron').remote;


    function textToFileWithSaveDialog(text) {
        var savePath = dialog.showSaveDialog();

        if (savePath != null) {
            writeTextToNewFile(text, savePath);
        }

    }

    function getFolderPathDialog() {
        var folderPath = dialog.showOpenDialog(require('electron').remote.getCurrentWindow(), {
            properties: ['openDirectory']
        });

        if (folderPath && folderPath.length > 0) {
            return folderPath[0];    
        }

        return null;

        
    }

    function createDirectoryIfNotExists(dir) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
    }

    function readTextFromFile(filePath) {
        return fs.readFileSync(filePath, 'utf8');
    };

    function writeTextToNewFile(text, filePath, resolvePath) {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        writeFileSyncRecursive(filePath, text, 'utf-8', resolvePath);
    };

    function cleanGitDirectory(gitDirectory) {



        fs.readdirSync(gitDirectory).forEach(info => {
            if (info != '.git') {
                deleteAllFilesFromDirectory(path.join(path.resolve(), gitDirectory, info));
            }
        })




    };

    function deleteAllFilesFromDirectory(path) {
        if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach(function (file, index) {
                var curPath = path + "/" + file;
                if (fs.lstatSync(curPath).isDirectory()) { // recurse
                    deleteAllFilesFromDirectory(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    }

    function writeFileSyncRecursive(filePath, content, charset, resolvePath) {
        if (resolvePath) {
            filePath = path.join(path.resolve(), filePath);
        } else {
            filePath = path.join(filePath);
        }

        // create folder path if not exists
        filePath.split(path.sep).slice(0, -1).reduce((last, folder) => {
            let folderPath = last ? (last + path.sep + folder) : folder
            if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath)
            return folderPath
        })

        fs.writeFileSync(filePath, content, charset)
    }

    return {
        createDirectoryIfNotExists: createDirectoryIfNotExists,
        readTextFromFile: readTextFromFile,
        writeTextToNewFile: writeTextToNewFile,
        deleteAllFilesFromDirectory: deleteAllFilesFromDirectory,
        cleanGitDirectory: cleanGitDirectory,
        textToFileWithSaveDialog: textToFileWithSaveDialog,
        getFolderPathDialog: getFolderPathDialog
    };
});