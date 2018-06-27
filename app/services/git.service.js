app.service('git', ['filesystem', 'config', 'status', function (filesystem, config, status) {

    const gitPromise = require('simple-git/promise');
    const git = require('simple-git');

    function checkRepository(onSuccess, onError) {
        // Rotina de verificação do repositório (clone caso não exista)
        filesystem.createDirectoryIfNotExists(config.getConfiguration('gitPath'));
        const gitOpenDir = gitPromise(config.getConfiguration('gitPath'));
        gitOpenDir.checkIsRepo()
            .then(isRepo => !isRepo && initialiseRepo(gitOpenDir))
            .then(() => gitOpenDir.fetch())
            .then(() => onSuccess());

        function initialiseRepo(gitOpenDir) {
            return gitOpenDir.init()
                .then(() =>
                    gitOpenDir
                    .addRemote('origin', `https://${config.getConfiguration('gitUser')}:${config.getConfiguration('gitPassword')}@${config.getConfiguration('gitRepository')}`)                    
                )
        }
    }

    function pushToRepository(afterPush, pushMessage) {

        status.setStatus(4);

        var onPushSuccess = function () {

            console.log('PUSH no Git realizado com sucesso.');

            if (afterPush) {
                afterPush();
            }

        };



        // Rotina de atualização do repositório
        git(config.getConfiguration('gitPath'))
            .exec(() => console.log('Iniciando PUSH no Git...'))
            .add('./*')
            .commit('[Askara], feito por "' + require("os").userInfo().username +'" na Máquina: "'+ require("os").hostname + '"\n' + pushMessage)
            .push(['-v', 'origin', 'master'], () => onPushSuccess());
    }

    function pullRepository(afterPull, onPullError) {
        var pullError = null;
        status.setStatus(2);

        var onPullSuccess = function () {
            console.log('PULL no Git Realizado com sucesso.');

            if (pullError) {
                onPullError(pullError);

            } else {
                afterPull();
            }
        };


        var onRepositoryCheckSuccess = function () {
            git(config.getConfiguration('gitPath'))
                .exec(() => console.log('Iniciando PULL no Git...'))
                .pull('origin', 'master', (err, update) => {

                    if (err) {
                        pullError = JSON.stringify(err);
                    }

                    if (update && update.summary.changes) {
                        console.log('Houve mudanças no diretório');
                    }
                })
                .exec(() => onPullSuccess());
        };

        // Rotina de verificação do repositório
        checkRepository(onRepositoryCheckSuccess, onPullError);
    }



    return {
        pushToRepository: pushToRepository,
        pullRepository: pullRepository
    };
}]);