const express = require('express')
const bodyParser = require('body-parser')
const mysql2 = require('mysql2')

const app = express()

//Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname));//

//coneccion BBDD
const db = mysql2.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database:'BBDD_Manzanas_Del_Cuidado',
})

db.connect((err)=>{
    if(err){
        console.error("Error"+err)
        return
    }
        console.log("Servidor activo")
})

//Registrar usuario
app.post('/crear',(req,res)=>{
    const {nombre, tipodedocumento, documento, manzana}=req.body
    console.log(nombre, tipodedocumento, documento, manzana)
    const jhon=`INSERT INTO usuario (Usu_NombreCompleto, Usu_TipoDocumento, Usu_NumeroDocumento, Usu_Ciudad) VALUES (?,?,?,?)` 
    db.query(jhon,[nombre, tipodedocumento, documento, manzana],(err,result)=>{
        if(err){
            console.error("Error"+err)
            res.status(500).send("Registro")
            return
        }
            console.log("Registro Exitoso")
            res.status(200).send("Listo los datos")
    })
   
})

//apertura del servidor

app.listen(3000,()=>{
    console.log('Servidor Node.js escuchando')
})