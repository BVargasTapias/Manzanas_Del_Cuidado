const express = require("express");
const bodyParser = require("body-parser");
const mysql2 = require("mysql2/promise");
const path = require('path')

const app = express();

//Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../front')));


//Conexion bbdd
const db = mysql2.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "BBDD_Manzanas_Del_Cuidado",
});

db.on("error", (err) => {
  console.error("error" + err)
})

//Registrar usuario
app.post('/crear', async (req, res) => {

  const { nombre, tipodedocumento, documento, manzana, telefono, correo, direccion, ocupacion } = req.body
  try {
    //Verificar el usuario
    const [ver] = await db.query(`SELECT * FROM Usuario WHERE Usu_NumeroDocumento=? AND Usu_TipoDocumento=?`, [documento, tipodedocumento])
   
    
    if (ver.length > 0) {
      console.log(ver);
      res.status(409).send(`<script>
        window.onload = function(){
            alert("Usuario ya existe")
            window.location.href = './inicio.html'
        }
    </script>`)
    }
  }
  catch (error) {
    console.error("Error en el servidor:", error);
    res.status(500).send("Error en el servidor")
  }
  /* const jhon = `INSERT INTO Usuario (Usu_NombreCompleto, Usu_TipoDocumento, Usu_NumeroDocumento, Usu_Ciudad, Usu_Telefono, Usu_CorreoElectronico, Usu_Direccion, Usu_Ocupacion) VALUES (?,?,?,?,?,?,?,?)`
  db.query(jhon, [nombre, tipodedocumento, documento, manzana, telefono, correo, direccion, ocupacion], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("pailas")
      return
    }
    console.log("Szs")
  }) */
})

//Apertura del servidor
app.listen(3000, () => {
  console.log(`Servidor Node.js escuchando`);
})