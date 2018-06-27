app.service('config', function () {
    var configurations = {
        connectionHost: 'localhost',
        connectionUser: 'sa',
        connectionPassword: '',
        connectionDatabase: '',
        doBackup: true,
        backupOnGit: true,
        backupOnFS: true,
        fsBackupPath : '',
        databaseType: 1,
        schemasToBackup: [],
        gitPath: '../askara-git-control/',
        gitUser: '',
        gitPassword: '',
        gitRepository: '',

    };

    function setConfiguration(name, value) {
        configurations[name] = value;
    };

    function getConfiguration(name) {
        if (configurations) {
            return configurations[name];
        }

        return null;
    };

    return {
        setConfiguration: setConfiguration,
        getConfiguration: getConfiguration
    };
});