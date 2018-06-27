/*
Descrição: Serviço para monitorar os status das consultas
Detalhes:

0: Aplicação pronta para executar uma consulta;
1: Efetuando consulta no banco de dados
2: Buscando informações do diteório GIT
3: Efetuando backup do esquema do banco de dados
4: Sincronizando base de dados com o GIT

*/
app.service('status', function () {
    var currentStatus = 0;

    function setStatus(value){
        currentStatus = value;
    }
   
    function getStatus(){
        return currentStatus;
    }

    return {
        setStatus: setStatus,
        getStatus: getStatus
    };
});