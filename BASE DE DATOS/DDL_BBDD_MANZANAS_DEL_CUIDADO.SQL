
DROP DATABASE bbdd_Manzanas_Del_Cuidado;  

CREATE DATABASE BBDD_Manzanas_Del_Cuidado
    DEFAULT CHARACTER SET = 'utf8mb4';

    USE BBDD_Manzanas_Del_Cuidado;

--Se crea la tabla de Manzanas.

CREATE TABLE Manzanas (
    ID_Manzanas INT AUTO_INCREMENT PRIMARY KEY,
    Man_Nombre VARCHAR (20),
    Man_Localidad VARCHAR (20),
    Man_Direccion VARCHAR (20)
)

--Se crea la tabla de Servicios.

CREATE TABLE Servicios (
    ID_Servicios INT AUTO_INCREMENT PRIMARY KEY,
    Ser_Nombre VARCHAR (20),
    Ser_Descripcion VARCHAR (20)
)

--Se crea tabla intermedia de Manzanas y Servicios.

CREATE TABLE Servicios_Manzanas (
    FK_ID_Servicios INT (10),
    FK_ID_Manzanas INT (10),
    FOREIGN KEY (FK_ID_Servicios) REFERENCES Servicios(ID_Servicios),
    FOREIGN KEY (FK_ID_Manzanas) REFERENCES Manzanas(ID_Manzanas)
)

 

CREATE TABLE Usuario (
    ID_Usuario INT AUTO_INCREMENT PRIMARY KEY,
    Usu_TipoDocumento SET ('Cedula de Ciudadania', 'Tarjeta de Identidad'),
    Usu_NumeroDocumento INT (10),
    Usu_NombreCompleto VARCHAR (20),
    Usu_Telefono INT (10),
    Usu_CorreoElectronico VARCHAR (20),
    Usu_Ciudad VARCHAR (20),
    Usu_Direccion VARCHAR (20),
    Usu_Ocupacion VARCHAR (30),
    FK_ID_Manzanas INT (10),
    FOREIGN KEY (FK_ID_Manzanas) REFERENCES Manzanas (ID_Manzanas)
)

-- Se crea tabla Solicitudes con llave foranea.

CREATE TABLE Solicitudes (
    ID_Solicitudes INT AUTO_INCREMENT PRIMARY KEY,
    Sol_Municipio VARCHAR (20),
    Sol_Establecimientos VARCHAR (20),
    FK_ID_Usuario INT (10),
    FOREIGN KEY (FK_ID_Usuario) REFERENCES Usuario (ID_Usuario)
)