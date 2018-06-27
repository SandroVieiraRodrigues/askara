app.service('mysql', ['schemabackup', 'config', function (schemabackup, config) {

    var mysql = require('mysql');

    var connection = {};
    var ddlKeywords = ['CREATE', 'ALTER', 'DROP', 'TRUNCATE'];

    function createConnectionInstance() {
        try {
            connection = mysql.createConnection({
                host: config.getConfiguration('connectionHost'),
                user: config.getConfiguration('connectionUser'),
                password: config.getConfiguration('connectionPassword'),
                database: config.getConfiguration('connectionDatabase')
            });

            return true;
        } catch (error) {
            return false;
        }
    }

    function performQuery(query, onSuccess, onError, shouldVerify) {

        this.createConnectionInstance();

        connection.connect(function (err) {
            if (err) {
                // Erro de conexão ao banco.
                console.log(err.code);
                console.log(err.fatal);
            }
        });

        connection.query(query, function (err, rows, fields) {

            var afterQueryExecution = function () {
                if (err) {
                    console.log("Ocorreu um erro ao executar a query:");
                    console.log(err);
                    if (onError) {
                        onError(err);
                    }
                } else {
                    console.log("Consulta executada com sucesso!");
                    onSuccess(rows);
                }
            };


            if (shouldVerify && hasDDLKeywords(query) && (config.getConfiguration('backupOnGit') || config.getConfiguration('backupOnFS'))) {

                var pushMessage = query;

                schemabackup.doBackup(afterQueryExecution, onError,query);
            } else {
                afterQueryExecution();
            }
        });

        connection.end(function () {
        });

    }

    function hasDDLKeywords(query) {
        query = query.toUpperCase();

        for (let index = 0; index < ddlKeywords.length; index++) {
            const element = ddlKeywords[index];

            if (query.indexOf(element) > -1) {
                return true;
            }
        }

        return false;
    }

    function getDatabases(onSuccess, onError) {
        var query = "SHOW DATABASES";

        var onQuerySuccess = function(data){
            var databases = data.filter(x=> x != 'information_schema' && x!= 'mysql' && x!= 'performance_schema' && x!= 'sys');
            onSuccess(databases);
        };

        var onQueryError = function(){
            if (onError) {
                onError();
            }
        };

        this.performQuery(query,onQuerySuccess,onQueryError);
    }

    return {
        createConnectionInstance: createConnectionInstance,
        performQuery: performQuery,
        getDatabases: getDatabases
    };
}]);