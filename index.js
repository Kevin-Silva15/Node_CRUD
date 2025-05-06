const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const hbs = require('express-handlebars');
const bodyParser = require('body-parser');
// bodyParser é um modulo que faz com que a gente receba valores que vem no corpo da requisição
const session = require('express-session');
// modulo pra usar session no js - tipo, variaveis globais temporarias

//configuração do handlebars   engine=motor
app.engine('hbs',hbs.engine({
    extname: 'hbs', //extensão do arquivo 
    defaultLayout: 'main', //layout padrão
}));
app.set('view engine','hbs'); //pra dizer que queremos usar essa engine


// app.use(express.static('public')); // pra apontar o caminho que taa o css e js, do front


app.use(bodyParser.urlencoded({extended:false}));

//importando a model Usuarios (tabela do db)
const Usuario = require('./models/Usuario');

//config das session
app.use(session({
    secret: 'Criadoumachavesl',
    resave: false,
    saveUninitialized: true
}));

app.get('/',(req,res)=>{
    if(req.session.errors){
        var arrayErros = req.session.errors;
        req.session.errors='';
        return res.render('index',{NavActiveCad:true, error:arrayErros})
    }
    if(req.session.success){
        req.session.success = false;
        return res.render('index',{NavActiveCad:true, msgSuccess:true})
    }
    res.render('index',{NavActiveCad:true}); //renderiza o arquivo index.hbs
});


app.get('/users',(req,res)=>{
    Usuario.findAll().then((valores)=>{ //findAll - pra pegar todos os valores de uma tabela!

        // console.log(valores.map(valores => valores.toJSON())); //facilicar o retorno e melhorar a visibilidade
        if(valores.length > 0 ){
            return res.render('users',{NavActiveUsers:true, table:true, usuarios:valores.map(valores => valores.toJSON())});
        }else{
            return res.render('users',{NavActiveUsers:true, table:false});
        }

    }).catch((err)=>{
        console.log(`houve um problema:${err}`)
    })


   
});

app.post('/editar',(req,res)=>{
    var id = req.body.id;
    Usuario.findByPk(id).then((dados)=>{
        return res.render('editar',{error:false, id:dados.id, nome:dados.nome, email:dados.email});
    }).catch((err)=>{
        console.log(err);
        return res.render('editar',{error:true, problema:'Não é possivel editar este registro!'});
    })
    
});

//trabalhando pegando a informações do post
// linkamos atraves do ''name'' dos campos la do for, não é ID nem Class.
app.post('/cad',(req,res)=>{
    //res.send(req.body);
    var nome = req.body.nome; //pegando o valor do form e colocando ela numa variavel, para validar dados
    var email = req.body.email;

    //ARRAY que vai ter os erros
    const erros = [];
    
    //Remover os espaços em branco antes e depois
    nome = nome.trim(); //trim, remove os espaçõs antes e depois
    email = email.trim();

    //Limpar o nome de caracteres especiais (Receber apenas letras)
    nome = nome.replace(/[^A-zÀ-ú\s]/gi,''); //expressão regular, aqui to falando o que ele pode aceitat, que é de A ate Z e acentos, e o gi,'' é que sera substituido por ''
    nome = nome.trim();

    //Verficar se esta vazio ou não o campo, mesmo com o required la no css
    if(nome==''|| typeof nome ==undefined || typeof nome==null){
        erros.push({mensagem: "Campo Nome não pode ser vazio!"});
    };

    //verificar se o campo nome é valido (Apenas Letras)
    if (!/^[A-Za-zÀ-ú\s'-]+$/i.test(nome.trim())) {
        erros.push({ mensagem: "Nome inválido!" });
    }
    
    //Verficar se esta vazio ou não o campo, mesmo com o required la no css
    if(email==''|| typeof email ===undefined || typeof email===null){
        erros.push({mensagem: "Campo Email não pode ser vazio!"});
    };

    //Verificar se o email é valido - usando regex
    if(!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email)){
        erros.push({mensagem:"Campo email inválido!"});
    };

    //se tiver dado erro, ele vai entrar la na array, com isso, ela vai printar o erro
    if(erros.length > 0){
        console.log(erros);
        req.session.errors = erros;
        req.session.success = false; //pra dizer que não teve sucesso
        return res.redirect('/');
    }

//Salvando no banco de dados
    //create adicionar informação na tabela
    Usuario.create({
        nome: nome,
        email: email.toLowerCase()
    }).then(function(){
        console.log('Validação realizada com sucesso!')
        req.session.success=true
        return res.redirect('/')
    }).catch(function(erro){
        console.log(`Ops, houve um erro: ${erro}`)
    });




    
   

});


//Salvar dados em um sessão, pra usar em outra rota, tipo um var global!
//Instalar o modulo session -  npm i express-session --save


app.post('/update',(req,res)=>{
    
     var nome = req.body.nome; 
     var email = req.body.email;
 
     
     const erros = [];
     
     
     nome = nome.trim(); 
     email = email.trim();
 
    
     nome = nome.replace(/[^A-zÀ-ú\s]/gi,''); 
     nome = nome.trim();
 
     
     if(nome==''|| typeof nome ==undefined || typeof nome==null){
         erros.push({mensagem: "Campo Nome não pode ser vazio!"});
     };
 
     
     if (!/^[A-Za-zÀ-ú\s'-]+$/i.test(nome.trim())) {
         erros.push({ mensagem: "Nome inválido!" });
     }
     
     
     if(email==''|| typeof email ===undefined || typeof email===null){
         erros.push({mensagem: "Campo Email não pode ser vazio!"});
     };
 
     
     if(!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email)){
         erros.push({mensagem:"Campo email inválido!"});
     };
 
     
     if(erros.length > 0){
         console.log(erros);
         return res.status(400).send({status:400, erro:erros});

     }

    //Atualizar os novos dados de um banco - update
    Usuario.update(
        {
        nome: nome,
        email: email.toLowerCase()
        },
        {
            where: {
                id: req.body.id
            }
        }).then((resultado)=>{
            return res.redirect('/users');
        }).catch((err)=>{
            console.log(err);
        })

})

//----------Deletar um dado
app.post('/del',(req,res)=>{
    Usuario.destroy({
        where:{
            id: req.body.id
        }
    }).then((retorno)=>{
        return res.redirect('/users');
    }).catch((err)=>{
        console.log(err);
    })
})







app.listen(PORT,()=>{
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});