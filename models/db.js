const Sequelize = require('sequelize');
const sequelize = new Sequelize('node_exemplo','root','',{
    host:'127.0.0.1',
    dialect: 'mysql',
    define:{
        charset: 'utf8',
        collate: 'utf8_general_ci',
        timestamps:true
    },
    loggin:false

})

//pra fazer a conexão, essas infos são bem importante!
// const sequelize = new Sequelize('nome do banco aqui','usuario aqui','senha aqui',

//testanto a coneção c o banco
// sequelize.authenticate().then(function(){
//     console.log('Banco Conectado!');
// }).catch(function(err){
//     console.log('Banco não conectado:'+err);
// });

module.exports = {Sequelize,sequelize}

