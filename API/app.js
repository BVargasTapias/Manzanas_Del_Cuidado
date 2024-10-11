const express = require("express");
const bodyParser = require("body-parser");
const mysql2 = require("mysql2");
const path = require('path')

const app = express();

//Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static( path.join(__dirname,'../front')));


//Conexion bbdd
const db = mysql2.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "BBDD_Manzanas_Del_Cuidado",
});

db.connect((err) => {
  if (err) {
    console.error("Error" + err);
    return;
  }
  console.log("Buena");
});

//Registrar usuario
app.post('/crear', (req,res)=>{
  console.log(req);
  
  const {nombre, tipodedocumento, documento, manzana, telefono, correo, direccion, ocupacion}=req.body
  
  
  console.log(nombre, tipodedocumento, documento, manzana, telefono, correo, direccion, ocupacion);
  const jhon = `INSERT INTO Usuario (Usu_NombreCompleto, Usu_TipoDocumento, Usu_NumeroDocumento, Usu_Ciudad, Usu_Telefono, Usu_CorreoElectronico, Usu_Direccion, Usu_Ocupacion) VALUES (?,?,?,?,?,?,?,?)`
  db.query (jhon,[nombre, tipodedocumento, documento, manzana, telefono, correo, direccion, ocupacion],(err,result)=>{
    if(err){
      console.error(err);
      res.status(500).send("pailas")
      return
    }
    console.log("Szs")
  })
})

//Apertura del servidor
app.listen(3000,()=>{
    console.log(`Servidor Node.js escuchando`);    
})