app.service('schemabackup', ['config', 'status', 'filesystem', 'git', '$injector', function (config, status, filesystem, git, $injector) {

    const path = require('path');

    var currentGitPushMessage = '';

    function SchemaData(type, name, schema) {
        this.type = type;
        this.name = name;
        this.schema = schema;
    }

    function mysqlBackup(onSuccess, onError) {

        var schemasToBackup = config.getConfiguration('schemasToBackup');
        var objectTypesToBackup = ['FUNCTION', 'TABLE', 'VIEW', 'PROCEDURE', 'TRIGGER'];
        var backupPromises = [];
        var backupQueries = {
            schemaInfo: filesystem.readTextFromFile('app/system/queries/mysql/schemainfo.sql'),
            createScript: 'SHOW CREATE {{OBJECT_TYPE}} {{OBJECT_NAME}}'
        };

        var getResultData = function (objectType, resultData) {

            var data = resultData[0];

            switch (objectType) {
                case 'FUNCTION':
                    return data['Create Function'];
                case 'TABLE':
                    return data['Create Table'];
                case 'VIEW':
                    return data['Create View'];
                case 'PROCEDURE':
                    return data['Create Procedure'];
                case 'TRIGGER':
                    return data['SQL Original Statement'];
                default:
                    throw 'Tratativa de retorno não tratada para o tipo de objeto ' + objectType;
            }

        };

        var backupRoutine = function (schemaData, promiseResolve) {
            var query = backupQueries.createScript.replace('{{OBJECT_TYPE}}', schemaData.type).replace('{{OBJECT_NAME}}', schemaData.name);

            $injector.get('mysql').performQuery(query, function (result) {
                var creationText = getResultData(schemaData.type, result);
                let filePath = path.join(config.getConfiguration('gitPath'), config.getConfiguration('connectionHost'), schemaData.schema, schemaData.type, schemaData.name + '.sql');
                filesystem.writeTextToNewFile(creationText, filePath, true);

                promiseResolve();
            });
        };

        if (schemasToBackup.length == 0)
            throw 'Nenhuma base definida para backup';


        $injector.get('mysql').performQuery(backupQueries.schemaInfo, function (result) {

            var schemaInfo = [];

            for (let index = 0; index < result.length; index++) {
                const element = result[index];
                if (schemasToBackup.indexOf(element.OBJECT_SCHEMA) > -1 && objectTypesToBackup.indexOf(element.OBJECT_TYPE) > -1)
                    schemaInfo.push(new SchemaData(element.OBJECT_TYPE, element.OBJECT_NAME, element.OBJECT_SCHEMA));
            }



            for (let index = 0; index < schemaInfo.length; index++) {
                const element = schemaInfo[index];

                var promise = new Promise((resolve, reject) => {
                    backupRoutine(element, resolve);
                });

                backupPromises.push(promise);
            }

            Promise.all(backupPromises)
                .then(() => {



                    var afterPush = function () {

                        console.log('SUUUUCESSSSO!');
                        if (onSuccess) {
                            onSuccess();
                        }
                    };



                    git.pushToRepository(afterPush,currentGitPushMessage);
                })
                .catch((e) => {
                    console.log('*erro*');
                    console.log(e);
                    if (onError) {
                        onError();
                    }

                });
        }, null, false);
    }

    function doBackup(onSuccess, onError, gitPushMessage) {

        if (gitPushMessage) {
            currentGitPushMessage = gitPushMessage;
        }


        filesystem.deleteAllFilesFromDirectory(config.getConfiguration('gitPath'));

        var afterPull = function () {

            filesystem.cleanGitDirectory(config.getConfiguration('gitPath'));

            status.setStatus(3);
            mysqlBackup(onSuccess);

        };


        git.pullRepository(afterPull, onError);


    }

    return {
        doBackup: doBackup
    };
}]);