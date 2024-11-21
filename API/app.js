const express = require("express");
const bodyParser = require("body-parser");
const mysql2 = require("mysql2/promise");
const path = require('path');
const moment = require('moment');
const session = require('express-session');
const { Console } = require("console");

const app = express();

//Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static((__dirname, '../front')));
app.use(express.static(path.join(__dirname, '../front')));

//Configurar la Sesión

app.use(session({
  secret: 'Miapp',
  resave: false,
  saveUninitialized: true
}))

//Conexion bbdd
const db = {
  host: "localhost",
  user: "root",
  password: "",
  database: "BBDD_Manzanas_Del_Cuidado",
};


//Registrar usuario
app.post('/crear', async (req, res) => {

  const { nombre, tipodedocumento, documento, manzana, telefono, correo, direccion, ocupacion } = req.body
  try {
    //Verificar el usuario
    const conect = await mysql2.createConnection(db)
    const [ver] = await conect.execute(`SELECT * FROM Usuario WHERE Usu_NumeroDocumento=? AND Usu_TipoDocumento=?`, [documento, tipodedocumento])


    if (ver.length > 0) {

      res.status(409).send(`<script>
        window.onload = function(){
            alert("Usuario ya existe")
            window.location.href = './inicio.html'
        }
    </script>`)
    }
    else {
      await conect.execute('INSERT INTO Usuario (Usu_NombreCompleto, Usu_TipoDocumento, Usu_NumeroDocumento, Usu_Telefono, Usu_CorreoElectronico, Usu_Direccion, Usu_Ocupacion,FK_ID_Manzanas) VALUES (?,?,?,?,?,?,?,?)', [nombre, tipodedocumento, documento, telefono, correo, direccion, ocupacion, manzana])
      res.status(201).send(`<script>
        window.onload = function(){
            alert("Datos guardados")
            window.location.href = './inicio.html'
        }
    </script>`)

    }
    await conect.end()
  }
  catch (error) {
    console.error("Error en el servidor:", error);
    res.status(500).send("Error en el servidor")
  }

})

//Enviar pagina de usuario

app.post('/sesion', async (req, res) => {
  const {
    documento, tipodedocumento } = req.body
  try {
    const conect = await mysql2.createConnection(db)
    const [datos] = await conect.execute(`SELECT * FROM Usuario WHERE Usu_NumeroDocumento=? AND Usu_TipoDocumento=?`, [documento, tipodedocumento])
    console.log(datos)
    if (datos.length > 0) {
      //const [manzana] = conect.execute('SELECT manzanas.Man_Nombre FROM usuario INNER JOIN manzanas ON usuario.ID_Manzanas=manzanas  WHERE usuario.Usu_NombreCompleto=?', [datos[0].Usu_NombreCompleto]);
      req.session.usuario = datos[0].Usu_NombreCompleto
      req.session.Documento = documento
      const usuario = { nombre: datos[0].Usu_NombreCompleto }
      res.locals.usuario = usuario
      res.locals.Documento = documento
      res.sendFile(path.join(__dirname, '../front/usuario.html'))
      await conect.end()
    }
    else {
      await conect.execute(`SELECT * FROM Usuario WHERE Usu_NumeroDocumento=? AND Usu_TipoDocumento=?`, [documento, tipodedocumento])
      res.status(201).send(`<script>
        window.onload = function(){
            alert("Usuario no existe")
            window.location.href = './registro.html'
        }
    </script>`)
    }
    await conect.end()
  }
  catch (error) {
    console.error("Error en el servidor:", error);
    res.status(500).send("Error en el servidor")
  }
})

app.get('/obtener-usuario', (req, res) => {
  const usuario = req.session.usuario
  if (usuario) {
    res.json({ Usu_NombreCompleto: usuario })
    console.log(usuario)
  }
  else {
    res.status(401).send('Usuario no autenticado')
  }
})

//Ruta para obtener los servicios del usuario

app.post('/obtener-servicios-usuario', async (req, res) => {
  const usuario = req.session.usuario
  try {
    const conect = await mysql2.createConnection(db)
    const [datos] = await conect.execute('SELECT servicios.Ser_Nombre FROM servicios INNER JOIN servicios_manzanas ON servicios_manzanas.FK_ID_Servicios=servicios.ID_Servicios INNER JOIN manzanas ON manzanas.ID_Manzanas=servicios_manzanas.FK_ID_Manzanas INNER JOIN usuario ON manzanas.ID_Manzanas=usuario.FK_ID_Manzanas WHERE usuario.Usu_NombreCompleto=?', [usuario])
    console.log(datos)
    res.json({ servicios: datos.map(hijo => hijo.Ser_Nombre) })
    await conect.end()
  }

  catch (error) {
    console.error("Error en el servidor:", error);
    res.status(500).send("Error en el servidor")
  }
})

// Ruta para guardar los servicios seleccionados por el usuario

app.post('/guardar-servicios-usuario', async (req, res) => {
  const usuario = req.session.usuario
  const Documento = req.session.Documento
  const { servicios, fechaHora } = req.body
  console.log(servicios)
  console.log(Documento)
  try {
    const conect = await mysql2.createConnection(db)
    const [IDS] = await conect.query('SELECT servicios.ID_Servicios FROM servicios WHERE servicios.Ser_Nombre=?', [servicios])
    const [IDU] = await conect.execute('SELECT usuario.ID_Usuario FROM usuario WHERE usuario.Usu_NumeroDocumento=?', [Documento])
    await conect.query('INSERT INTO solicitudes (Sol_FechaHora,FK_ID_Usuario ,Sol_Codigoserv) VALUES (?,?,?)', [fechaHora, IDU[0].ID_Usuario, IDS[0].ID_Servicios])
    res.send().status(200)
    await conect.end()
  }

  catch (error) {
    console.error("Error en el servidor:", error)
    res.status(500).send("Error en el servidor");
  }
})


app.post('/obtener-servicios-guardados', async (req, res) => {
  const usuario = req.session.usuario;
  const Documento = req.session.Documento
  try {
    // Conectar a la base de datos y consultar los servicios guardados por el usuario
    const conect = await mysql2.createConnection(db)
    const [IDU] = await conect.execute('SELECT usuario.ID_Usuario FROM usuario WHERE usuario.Usu_NumeroDocumento=?', [Documento])
    const [serviciosGuardadosData] = await conect.execute('SELECT servicios.Ser_Nombre, solicitudes.Sol_Fechahora, solicitudes.FK_ID_Solicitudes FROM servicios INNER JOIN servicios_manzanas ON servicios_manzanas.FK_ID_Servicios=servicios.ID_Servicios INNER JOIN manzanas ON servicios_manzanas.FK_ID_Manzanas=manzanas.ID_Manzanas INNER JOIN usuario ON manzanas.ID_Manzanas=usuario.FK_ID_Manzanas INNWE JOIN solicitudes ON usuario.Id=solicitudes.ID1 WHERE solicitudes.ID1=? AND servicios.ID_Servicios=solicitudes.Sol_Codigoserv;', [IDU[0].Id]);

    console.log(serviciosGuardadosData)
    console.log(IDU[0].Id)
    const serviciosGuardadosFiltrados = serviciosGuardadosData.map(servicio => ({
      Nombre: servicio.Nombre,
      Fecha: servicio.Fecha,
      id: servicio.Id_solicitudes
      //Agrega más propiedades si es necesario
    }));
    //Enviar los datos de los servidores guardados al cliente
    res.json({ serviciosGuardados: serviciosGuardadosFiltrados
    });
    // Cerrar la conexión
    await conect.end();
  } catch (error) {
    console.error('Error en el servidor:', error);
    res.status(500).send('Error en el servidor')
  }

});

app.delete('/eliminar-servicio/:id', async (req, res) => {
  const servicioId = req.params.id;
  const eliminarServicios=db[Id];

  if (!account){
    return res.status(404).json({error: "Servicio no Eliminado"});
  }
delete db [Id];
return res.status(204).send('Servicios eliminado');
})


//Apertura del servidor
app.listen(3000, () => {
  console.log(`Servidor Node.js escuchando`);
})

