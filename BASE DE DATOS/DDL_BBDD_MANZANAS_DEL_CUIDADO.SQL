
DROP DATABASE bbdd_Manzanas_Del_Cuidado;  

CREATE DATABASE BBDD_Manzanas_Del_Cuidado
    DEFAULT CHARACTER SET = 'utf8mb4';

    USE BBDD_Manzanas_Del_Cuidado;

--Se crea la tabla de Manzanas.

CREATE TABLE Manzanas (
    ID_Manzanas INT AUTO_INCREMENT PRIMARY KEY,
    Man_Nombre SET ('Bosa', 'Suba', 'Chapinero'),
    Man_Direccion VARCHAR (20)
)

--Se crea la tabla de Servicios.

CREATE TABLE Servicios (
    ID_Servicios INT AUTO_INCREMENT PRIMARY KEY,
    Ser_Nombre VARCHAR (30),
    Ser_Descripcion VARCHAR (50)
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
    Usu_TipoDocumento SET ('CC','TI'),
    Usu_NumeroDocumento INT (10),
    Usu_NombreCompleto VARCHAR (50),
    Usu_Telefono VARCHAR (10),
    Usu_CorreoElectronico VARCHAR (40),
    Usu_Manzana SET ('Bosa','Chapinero','Suba'),
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

ALTER TABLE Usuario ADD UNIQUE (Usu_NumeroDocumento)

SELECT * FROM Usuario WHERE Usu_NumeroDocumento=? AND Usu_TipoDocumento=? 

SELECT manzanas.Use_NombreCompleto FROM usuario 
INNER JOIN manzanas ON usuario.ID_Manzanas=ID_Manzanas 
WHERE usuario.Usu_NombreCompleto=?