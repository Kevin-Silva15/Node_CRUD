//tabela do usuario
const db = require('./db'); //importando as config do db

const Usuario = db.sequelize.define('usuario',{
    id:{
        type:db.Sequelize.INTEGER, //tipo do dado que vai ter
        autoIncrement:true, //pra ele adicionar id automaticamente
        allowNull: false, //pra não aceitar  campo vazio
        primaryKey:true //pra definir como pk
    },
    nome:{
        type:db.Sequelize.STRING,
        allowNull: false
    },
    email:{
        type:db.Sequelize.STRING,
        allowNull: false
    },
})

//.sync() - pra sicronizar c/ a tabela, caso não tenha uma tabela, ela cria uma
Usuario.sync();

module.exports = Usuario;

