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
      const rolUsuario = datos[0].Usu_TipoUsuario
      res.locals.usuario = usuario
      res.locals.Documento = documento
      switch (rolUsuario) {
        case "Administrador":
          res.sendFile(path.join(__dirname, '../front/administrador.html'))
          break;
        case "Usuario":
          res.sendFile(path.join(__dirname, '../front/usuario.html'))
          break;

        case null:

          res.sendFile(path.join(__dirname, '../front/usuario.html'))
          break;
          default:
            break;
        }

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

app.post('/obtener-usuario', (req, res) => {
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
  console.log(req.session.usuario);
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
  const Documento = req.session.Documento;
  try {
      // Conectar a la base de datos y consultar los servicios guardados por el usuario
      const conect = await mysql2.createConnection(db);
      const [IDU] = await conect.execute('SELECT usuario.ID_Usuario FROM usuario WHERE usuario.Usu_NumeroDocumento=?', [Documento]);
      const [serviciosGuardadosData] = await conect.execute('SELECT servicios.Ser_Nombre, solicitudes.Sol_FechaHora, solicitudes.ID_Solicitudes FROM servicios INNER JOIN servicios_manzanas ON servicios_manzanas.FK_ID_Servicios=servicios.ID_Servicios INNER JOIN manzanas ON servicios_manzanas.FK_ID_Manzanas=manzanas.ID_Manzanas INNER JOIN usuario ON manzanas.ID_Manzanas=usuario.FK_ID_Manzanas INNER JOIN solicitudes ON usuario.ID_Usuario=solicitudes.FK_ID_Usuario WHERE solicitudes.FK_ID_Usuario=? AND servicios.ID_Servicios=solicitudes.Sol_Codigoserv;', [IDU[0].ID_Usuario]);

      const serviciosGuardadosFiltrados = serviciosGuardadosData.map(servicio => ({
          Nombre: servicio.Ser_Nombre,
          Fecha: servicio.Sol_FechaHora,
          id: servicio.ID_Solicitudes,
      }));

      res.json({ serviciosGuardados: serviciosGuardadosFiltrados });
      await conect.end();
  } catch (error) {
      console.error('Error en el servidor:', error);
      res.status(500).send('Error en el servidor');
  }
});


app.post('/manzanas', async (req, res) => {
  try {
    const conect = await mysql2.createConnection(db);
    const [tiposServicios] = await conect.execute('SELECT ID_Manzanas, Man_Nombre FROM manzanas');
    res.json(tiposServicios);
    console.log(tiposServicios);
    await conect.end();
  } catch (error) {
    console.error('Error al obtener tipos de servicios:', error);
    res.status(500).send('Error al obtener tipos de servicios');
  }
});

app.post('/cerrar-sesion', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
      res.status(500).send('Error al cerrar sesión');
    } else {
      res.status(200).send('Sesión cerrada con éxito');
    }
  });
});

app.delete('/eliminar-servicio/:id', async (req, res) => {
  const solicitudID = req.params.id; 
  console.log("Solicitud: ", solicitudID);

  try {
    const conect = await mysql2.createConnection(db)
    await conect.execute('DELETE FROM Solicitudes WHERE ID_Solicitudes =?', [solicitudID])
    res.send().status(200)
    await conect.end();

  } catch (error) {
    console.error('Error al eliminar la solicitud:', error);
    res.status(500).send('Error al eliminar la solicitud');
  }
})

// ADMINISTRADOR

//Obtener Usuarios
app.get('/usuarios', async (req, res) => {
  const usuario = req.session.usuario;

  try {
    const conect = await mysql2.createConnection(db);
    const [usuariosData] = await conect.execute('SELECT * FROM Usuario');
    const usuariosGuardadosFiltrados = usuariosData.map(usuario => ({
      Nombre: usuario.Usu_NombreCompleto,
      IDU: usuario.ID_Usuario
    }));
    res.json({ usuariosGuardados: usuariosGuardadosFiltrados });
    await conect.end();
  } catch (error) {
    console.error('Error en el servidor:', error);
    res.status(500).send('Error en el servidor');
  }
});


//Modificar Usuario
app.get('/modificar-usuario/:IDU', async (req, res) => {
  const solicitudID = req.params.IDU;

  try {
    const conect = await mysql2.createConnection(db);
    const [modificarData] = await conect.execute(
      'SELECT * FROM Usuario WHERE ID_Usuario = ?',
      [solicitudID]
    );
    console.log(modificarData);
    
    const [manzanaName] = await conect.execute(
      'SELECT manzanas.Man_Nombre FROM manzanas INNER JOIN usuario ON usuario.FK_ID_Manzanas = manzanas.ID_Manzanas WHERE FK_ID_Manzanas = ?', [modificarData[0].FK_ID_Manzanas]
    )

    const modificarManzana = manzanaName.map((man) => ({
      Manzana: man.Man_Nombre
    }))

    const datosModificarFiltrados = modificarData.map((modificar) => ({
      Nombre: modificar.Usu_NombreCompleto,
      Correo: modificar.Usu_CorreoElectronico,
      Rol: modificar.Usu_TipoUsuario,
      Telefono: modificar.Usu_Telefono,
      Direccion: modificar.Usu_Direccion,
      Ocupacion: modificar.Usu_Ocupacion,
      IDU: modificar.ID_Usuario,
    }));

    res.json({ modificarDatos: datosModificarFiltrados, modificarManzana: modificarManzana});
    await conect.end();
  } catch (error) {
    console.error('Error en el servidor:', error);
    res.status(500).send('Error en el servidor');
  }
});


app.put('/modificar-usuario/:IDU', async (req, res) => {
  const IDU = req.params.IDU;
  const { nombre, correo, rol, telefono, direccion, ocupacion } = req.body;
  const { manzana } = req.body;

  try {
    const conect = await mysql2.createConnection(db);
    const [Manzana] = await conect.execute('SELECT manzanas.ID_Manzanas FROM manzanas WHERE Man_Nombre = ?', [manzana])
    //console.log(Manzana);
    await conect.execute(
      'UPDATE Usuario SET Usu_NombreCompleto = ?, Usu_CorreoElectronico = ?, Usu_TipoUsuario = ?, Usu_Telefono = ?, Usu_Direccion = ?, Usu_Ocupacion = ?, FK_ID_Manzanas = ? WHERE ID_Usuario = ?',
      [nombre, correo, rol, telefono, direccion, ocupacion, Manzana[0].ID_Manzanas, IDU]
    );
    res.status(200).send("Usuario actualizado con éxito");
    await conect.end();
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    res.status(500).send('Error en el servidor');
  }
});



app.get('/servicios', async (req, res) => {
  //const usuario = req.session.usuario;

  try {
    const conect = await mysql2.createConnection(db);
    const [serviciosData] = await conect.execute('SELECT * FROM Servicios');
    const serviciosGuardadosFiltrados = serviciosData.map(servicios => ({
      Nombre: servicios.Ser_Nombre,
      Descripcion: servicios.Ser_Descripcion,
      IDS: servicios.ID_Servicios
    }));
    res.json({ serviciosGuardados: serviciosGuardadosFiltrados });
    await conect.end();
  } catch (error) {
    console.error('Error en el servidor:', error);
    res.status(500).send('Error en el servidor');
  }
});

//Elinar Servicio en la base
app.delete('/eliminar-servicio-base/:IDS', async (req, res) => {
  const servicioID = req.params.IDS;
  console.log(req.params);

  try {
    const conect = await mysql2.createConnection(db)
    await conect.execute('DELETE FROM Servicios WHERE ID_Servicios =?', [servicioID])
    res.send().status(200)
    await conect.end();

  } catch (error) {
    console.error('Error al eliminar el servicio:', error);
    res.status(500).send('Error al eliminar el servicio');
  }
})

app.delete('/eliminar-manzana-base/:IDM', async (req, res) => {
  const solicitudID = req.params.IDM; 
  console.log("Solicitud: ", solicitudID);

  try {
    const conect = await mysql2.createConnection(db)
    await conect.execute('DELETE FROM Manzanas WHERE ID_Manzanas =?', [solicitudID])
    res.send().status(200)
    await conect.end();

  } catch (error) {
    console.error('Error al eliminar la solicitud:', error);
    res.status(500).send('Error al eliminar la solicitud');
  }
})

// Ruta para obtener la información de una manzana específica
app.get('/manzana/:id', async (req, res) => {
  const { id } = req.params;
  const result = await db.query('SELECT * FROM Manzanas WHERE ID_Manzanas = ?', [id]);
  if (result.length > 0) {
      res.json(result[0]);
  } else {
      res.status(404).send('Manzana no encontrada');
  }
});

// Ruta para actualizar una manzana
app.put('/manzana/:id', async (req, res) => {
  const { id } = req.params;
  const { Man_Nombre, Man_Direccion } = req.body;
  const result = await db.query('UPDATE Manzanas SET Man_Nombre = ?, Man_Direccion = ? WHERE ID_Manzanas = ?', [Man_Nombre, Man_Direccion, id]);
  if (result.affectedRows > 0) {
      res.send('Manzana actualizada correctamente');
  } else {
      res.status(400).send('Error al actualizar la manzana');
  }
});


//Eliminar Usuario
app.delete('/eliminar-usuario/:IDU', async (req, res) => {
  const usuarioID = req.params.IDU;
  console.log(req.params);

  try {
    const conect = await mysql2.createConnection(db)
    await conect.execute('DELETE FROM Usuario WHERE ID_Usuario =?', [usuarioID])
    res.send().status(200)
    await conect.end();

  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    res.status(500).send('Error al eliminar el usuario');
  }
})

//crear servicio
app.post('/crear-servicio', async (req, res) => {
  const { nombreServicio, descripcionServicio } = req.body;

  try {
      const conect = await mysql2.createConnection(db);
      await conect.execute(
          `INSERT INTO Servicios (Ser_Nombre, Ser_Descripcion) VALUES (?, ?)`,
          [nombreServicio, descripcionServicio]
      );
      res.status(200).json({ message: "Servicio agregado correctamente" });
  } catch (error) {
      console.error("Error al agregar servicio:", error);
      res.status(500).json({ error: "Error al agregar servicio" });
  }
});


app.get('/obtener-manzanas', async (req, res) => {
  const usuario = req.session.usuario;

  try {
    const conect = await mysql2.createConnection(db);
    const [manzanasData] = await conect.execute('SELECT * FROM Manzanas');
    const manzanasGuardadasFiltradas = manzanasData.map(manzana => ({
      Nombre: manzana.Man_Nombre,
      IDM: manzana.ID_Manzanas
    }));
    res.json({ manzanasGuardadas: manzanasGuardadasFiltradas });
    await conect.end();
  } catch (error) {
    console.error('Error en el servidor:', error);
    res.status(500).send('Error en el servidor');
  }
});




//Crear Manzana
app.post('/crear-manzana', async (req, res) => {
  const { nombreManzana, ubicacionManzana } = req.body;
  try {
    const conect = await mysql2.createConnection(db);
    await conect.execute(
      `INSERT INTO Manzanas (Man_Nombre, Man_Direccion) VALUES (?, ?)`,
      [nombreManzana, ubicacionManzana]
    );
    res.status(200).json({ message: "Manzana agregada correctamente" });
  } catch (error) {
    console.error("Error al agregar manzana:", error);
    res.status(500).json({ error: "Error al agregar manzana" });
  }
});



//Agregar Servicio
app.post('/agregar-servicio', async (req, res) => {
  try {
    const conect = await mysql2.createConnection(db);
    const [serviciosData] = await conect.execute('SELECT * FROM Servicios');
    
    const serviciosGuardadosFiltrados = serviciosData.map(servicios => ({
      Ser_Nombre: servicios.Ser_Nombre,
      Ser_Descripcion: servicios.Ser_Descripcion,
      ID_Servicios: servicios.ID_Servicios
    }));
    
    // Aseguramos que el cliente reciba solo los datos necesarios
    res.json(serviciosGuardadosFiltrados);
    await conect.end();
  } catch (error) {
    console.error('Error en el servidor:', error);
    res.status(500).send('Error en el servidor');
  }
});




// Endpoint para agregar un servicio a una manzana
app.post('/agregar-servicio-manzana', async (req, res) => {
  try {
      const { servicios, manzana } = req.body;
      
      const conect = await mysql2.createConnection(db);

      // Insertar los servicios seleccionados en la tabla intermedia Servicios_Manzanas
      for (let i = 0; i < servicios.length; i++) {
          await conect.execute(
              'INSERT INTO Servicios_Manzanas (FK_ID_Servicios, FK_ID_Manzanas) VALUES (?, ?)',
              [servicios[i], manzana]
          );
      }

      res.json({ success: true, message: 'Servicios agregados correctamente.' });
      await conect.end();
  } catch (error) {
      console.error('Error al agregar los servicios:', error);
      res.status(500).send('Error en el servidor');
  }
});

// Ruta para crear una nueva manzana


// Cerrar sesion
app.post('/cerrar-sesion', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
      res.status(500).send('Error al cerrar sesión');
    } else {
      res.status(200).send('Sesión cerrada con éxito');
    }
  });
});


//Apertura del servidor
app.listen(3000, () => {
  console.log(`Servidor Node.js escuchando`);
})