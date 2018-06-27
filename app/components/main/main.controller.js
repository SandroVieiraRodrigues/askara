app.controller('mainController', function ($scope, status, $document, $timeout, mysql, i18nService, git, electron, schemabackup, filesystem, config, git) {

    // Local Vars
    var vm = this;
    var currentEditorValue = '';
    var dataTableControl = null;

    // Global Vars
    vm.refresh = false;
    vm.queryData = [];
    vm.systemMessage = '';
    vm.applicationStatus = 0;
    vm.aceOptions = {
        theme: 'sqlserver',
        useWrapMode: true,
        showGutter: false,
        mode: 'mysql',
        firstLineNumber: 'infinte',
        enableSnippets: true,
        showGutter: true,
        highlightActiveLine: true,
        onChange: function (_editor) {
            currentEditorValue = _editor[1].getValue();
        },
        onLoad: function (_editor) {
            console.log('Ace editor loaded successfully');
            var _session = _editor.getSession();
            _session.setUndoManager(new ace.UndoManager());
            _editor.focus();
            _editor.setFontSize(16);
            _editor.setShowPrintMargin(false);
        }

    };
    vm.configurationDialog = {
        loading: false,
        connectionValidated: false,
        gitValidated: false,
        error: {
            show: false,
            message: ''
        },
        databaseTypes: [
            {
                code: 0,
                name: 'MySql'
            }
        ],
        configurationData: {
            databaseType: 0,
            doBackup: false,
            connectionHost: '',
            connectionUser: '',
            connectionPassword: '',
            connectionDatabase: '',
            backupOnGit: false,
            backupOnFS: false,
            databaseType: 1,
            schemasToBackup: [],
            fsBackupPath: '',
            gitPath: '../askara-git-control/',
            gitUser: '',
            gitPassword: '',
            gitRepository: '',
        }
    };

    // Global Functions
    vm.performQuery = function () {

        var onSuccess = function (result) {
            status.setStatus(0);

            vm.queryData = result;

            if (result.length && result.length > 0) {
                document.getElementById('resultsTab').click();
                vm.systemMessage = 'Consulta realizada com sucesso. Foram retornada(s) ' + result.length + ' linha(s).';
            } else {
                vm.systemMessage = 'Consulta realizada com sucesso. Foram retornada(s) 0 linha(s).';
            }

            $scope.$apply();
        };

        var onError = function (result) {
            status.setStatus(0);
            vm.systemMessage = 'Erro ao executar consulta. Detalhes: \n' + JSON.stringify(result);
            document.getElementById('messagesTab').click();
            $scope.$apply();
        };

        if (currentEditorValue && vm.applicationStatus == 0) {
            vm.queryData = [];
            vm.applicationStatus = 1;
            status.setStatus(1);
            document.getElementById('messagesTab').click();
            vm.systemMessage = 'Executando consulta: ', currentEditorValue;
            mysql.performQuery(currentEditorValue, onSuccess, onError, true);
        }
    };


    vm.saveConfigurations = function () {
        config.setConfiguration('databaseType', vm.configurationDialog.configurationData.databaseType);
        config.setConfiguration('doBackup', vm.configurationDialog.configurationData.doBackup);
        config.setConfiguration('connectionHost', vm.configurationDialog.configurationData.connectionHost);
        config.setConfiguration('connectionUser', vm.configurationDialog.configurationData.connectionUser);
        config.setConfiguration('connectionPassword', vm.configurationDialog.configurationData.connectionPassword);
        config.setConfiguration('connectionDatabase', (vm.configurationDialog.configurationData.connectionDatabase) ? vm.configurationDialog.configurationData.connectionDatabase.name : null);
        config.setConfiguration('backupOnGit', vm.configurationDialog.configurationData.backupOnGit);
        config.setConfiguration('backupOnFS', vm.configurationDialog.configurationData.backupOnFS);
        config.setConfiguration('schemasToBackup', vm.configurationDialog.databases.map(x => x.name));
        config.setConfiguration('gitPath', vm.configurationDialog.configurationData.gitPath);
        config.setConfiguration('gitUser', vm.configurationDialog.configurationData.gitUser);
        config.setConfiguration('gitPassword', vm.configurationDialog.configurationData.gitPassword);
        config.setConfiguration('gitRepository', vm.configurationDialog.configurationData.gitRepository);

        $("#modalConfiguration").modal('hide');

    };

    vm.canSaveConfigurations = function () {
        return hasValidConfigurations();
    };

    vm.openChooseFSBackupFolderDialog = function () {
        vm.configurationDialog.configurationData.fsBackupPath = filesystem.getFolderPathDialog();
    };

    vm.connectionsConfigChanged = function () {
        vm.configurationDialog.connectionValidated = false;
    };

    vm.testDatabaseConnection = function () {
        vm.configurationDialog.error.show = false;
        config.setConfiguration('connectionHost', vm.configurationDialog.configurationData.connectionHost);
        config.setConfiguration('connectionUser', vm.configurationDialog.configurationData.connectionUser);
        config.setConfiguration('connectionPassword', vm.configurationDialog.configurationData.connectionPassword);
        config.setConfiguration('connectionDatabase', null);

        getDatabases();
    };

    vm.openConfigurationModal = function () {
        $('#modalConfiguration').modal({
            'backdrop': 'static',
            'keyboard': false
        });
    };

    vm.saveResults = function () {
        var parsedData = JSON.parse(angular.toJson(vm.queryData));
        var csvData = CSV(parsedData);
        filesystem.textToFileWithSaveDialog(csvData);
    };

    vm.closeApplication = function () {
        electron.closeApplication();
    };

    vm.zoomIn = function () {
        electron.zoomIn();
    };

    vm.zoomOut = function () {
        electron.zoomOut();
    };

    vm.resetZoom = function () {
        electron.resetZoom();
    };

    vm.toggleFullScreen = function () {
        electron.toggleFullScreen();
    };

    vm.isFullScreen = function () {
        return electron.isFullScreen();
    };

    

    // Local Functions

    function getDatabases() {
        switch (vm.configurationDialog.configurationData.databaseType) {
            case 0:

                vm.configurationDialog.loading = true;

                var query = 'SHOW DATABASES';
                var databasesToIgnore = ['information_schema', 'mysql', 'performance_schema', 'sys'];

                var onSuccess = function (data) {

                    var databases = [];

                    for (let index = 0; index < data.length; index++) {
                        const element = data[index];
                        if (databasesToIgnore.indexOf(element.Database) == -1) {
                            databases.push({
                                name: element.Database,
                                monitored: false
                            });
                        }
                    }

                    vm.configurationDialog.configurationData.connectionDatabase = null;
                    vm.configurationDialog.databases = databases;
                    vm.configurationDialog.loading = false;
                    vm.configurationDialog.connectionValidated = true;
                };

                var onError = function () {
                    vm.configurationDialog.loading = false;
                    vm.configurationDialog.connectionValidated = false;
                    vm.configurationDialog.error.show = true;
                    vm.configurationDialog.error.message = 'Erro ao buscar a lista de Banco de Dados. Verifique as credenciais de acesso a instância e tente novamente.';
                };

                mysql.performQuery(query, onSuccess, onError);

                break;
            default:
                break;
        }

    }

    function resizeEditor() {
        var editor = document.getElementById("aceEditor");
        if (editor) {
            editor.style.height = window.innerHeight - 300 - 38 - 58 + 'px';
        }
    }

    function initialize() {
        vm.systemMessage = 'Sistema iniciado com sucesso.'

        resizeEditor();
        updateApplicationStatus();

        if (!hasValidConfigurations()) {
            vm.openConfigurationModal();

        }
    };

    function hasValidConfigurations() {

        if (vm.configurationDialog.connectionValidated && !vm.configurationDialog.configurationData.doBackup) {
            return true;
        }

        if (vm.configurationDialog.connectionValidated && vm.configurationDialog.configurationData.doBackup && vm.configurationDialog.databases.find(x => x.monitored)) {
            if (
                vm.configurationDialog.configurationData.backupOnFS
                && vm.configurationDialog.configurationData.backupOnGit

                && !isEmptyOrSpaces(vm.configurationDialog.configurationData.fsBackupPath)

                && !isEmptyOrSpaces(vm.configurationDialog.configurationData.gitUser)
                && !isEmptyOrSpaces(vm.configurationDialog.configurationData.gitPassword)
                && !isEmptyOrSpaces(vm.configurationDialog.configurationData.gitRepository)
            ) {
                return true;
            }

            if (
                vm.configurationDialog.configurationData.backupOnGit
                && !vm.configurationDialog.configurationData.backupOnFS
                && !isEmptyOrSpaces(vm.configurationDialog.configurationData.gitUser)
                && !isEmptyOrSpaces(vm.configurationDialog.configurationData.gitPassword)
                && !isEmptyOrSpaces(vm.configurationDialog.configurationData.gitRepository)

            ) {
                return true;
            }

            if (
                vm.configurationDialog.configurationData.backupOnFS
                && !vm.configurationDialog.configurationData.backupOnGit
                && !isEmptyOrSpaces(vm.configurationDialog.configurationData.fsBackupPath)
            ) {
                return true;
            }


        }


        return false;
    }

    function isEmptyOrSpaces(str) {
        return str === null || str.match(/^ *$/) !== null;
    }

    function updateApplicationStatus() {
        $timeout(function () {
            vm.applicationStatus = status.getStatus();

            updateApplicationStatus();
        }, 1000);
    }

    function CSV(array) {
        var keys = Object.keys(array[0]);
        var result = keys.join("\t") + "\n";
        array.forEach(function (obj) {
            keys.forEach(function (k, ix) {
                if (ix) result += "\t";
                result += obj[k];
            });
            result += "\n";
        });

        return result;
    }

    // Listeners    
    $document.bind('keyup', function (e) {
        if (e.keyCode == 116) {
            vm.performQuery();
        }
    });

    window.onresize = function () {
        resizeEditor();
    };

    // Initialize
    initialize();


});

