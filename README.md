
# Introdução

ADDLM (Askara DLL Manager): Sistema para Controle e Versionamento de Operações DDL Realizadas no SGBD Oracle MySQL com Foco no Desenvolvedor.

O Askara, é uma **ferramenta de gerenciamento de banco de dados** multiplataforma desenvolvida em [ElectronJs](https://electronjs.org/) que tem como principal característica a funcionalidade de versionar o esquema  ([DDL](https://en.wikipedia.org/wiki/Data_definition_language)) dos bancos de dados operados em binários e sincronizá-los com um repositório GIT.

Foi desenvolvido como trabalho de conclusão para a disciplina de graduação **Bacharelado em Sistemas de Informação** pela **Pontifícia Universidade Católica de Minas Gerais**, em Betim. Sendo, seus desenvolvedores:

 - Rodrigo Júnior de Assis (https://github.com/rodrigojrkall)
 - Sandro Vieira Rodrigues (https://github.com/SandroVieiraRodrigues)

E orientador do TCC:

 - Alisson Rabelo Arantes (http://lattes.cnpq.br/5671565929117484)

A versão atual da aplicação contempla:


 - Suporte a bancos de dados [MySql](https://www.mysql.com/)
 - Interface de usuário simples com possibilidade de execução de scripts, exportação dos dados de retorno de uma consulta no formato [CSV](https://pt.wikipedia.org/wiki/Comma-separated_values), e a configuração das conexões a bancos de dados e repositórios GIT.
 - Geração automática de binários que refletem a versão do esquema dos bancos de dados monitorados, e registro destes em servidor GIT, a partir  do monitoramento de scripts executados que contenham comandos [DDL](https://pt.wikipedia.org/wiki/Linguagem_de_defini%C3%A7%C3%A3o_de_dados).
 
# Instalação

Para instalação, é necessário que tenha as seguintes aplicações/ferramentas instaladas no sistema:
- [Node.JS](https://nodejs.org/)
- [GIT](https://git-scm.com/)

Certificando-se que estas estão instaladas, siga o passo a passo:


 1. Abra o Prompt de comando
 2. Instale o [Bower](https://bower.io/) (caso não o tenha instalado), a partir do comando: 
```bash
npm install -g bower
```
 2. Instalar o [Electron](https://electronjs.org/) (caso não o tenha instalado), a partir do comando: 
```bash
npm install -g electron
```
 3. A partir do prompt de comando, acesse o diretório em que se encontram os binários do **Askara**.
 3. Execute o comando:
```bash
npm install
```
 4. Ao término da execução do comando anterior, execute o comando:
```bash
bower install
```
 5. Com isso, a aplicação está pronta para ser executada. Bastando, sempre que desejar executá-la, acessar o diretório da aplicação com o prompt de comando e executar o seguinte comando:
```bash
electron .
```
# Licença

O código do **Askara** é livre para uso, e está sob a licença [MIT](https://opensource.org/licenses/MIT). 
