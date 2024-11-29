-- Active: 1726397805152@@127.0.0.1@3306@bbdd_manzanas_del_cuidado
INSERT INTO Servicios
    (Ser_Nombre, Ser_Descripcion)
VALUES
    ('Limpieza', 'Servicio de limpieza general'),
    ('Jardinería', 'Cuidado de jardines y plantas'),
    ('Transporte', 'Servicios de mudanza y transporte'),
    ('Plomería', 'Reparaciones de fontanería'),
    ('Electricidad', 'Servicios eléctricos y reparaciones'),
    ('Pintura', 'Pintura de interiores y exteriores'),
    ('Mantenimiento', 'Servicios de mantenimiento general');

INSERT INTO Manzanas
    (Man_Nombre, Man_Direccion)
VALUES
    ('Bosa', 'Calle Falsa 123'),
    ('Suba', 'Avenida Principal 456'),
    ('Chapinero', 'Boulevard de la Paz 789');

INSERT INTO servicios_manzanas
    (FK_ID_Servicios, FK_ID_Manzanas)
VALUES
    (1, 1),
    -- Limpieza en Bosa
    (1, 2),
    -- Limpieza en Suba
    (2, 1),
    -- Jardinería en Bosa
    (2, 3),
    -- Jardinería en Chapinero
    (3, 1),
    -- Transporte en Bosa
    (3, 2),
    -- Transporte en Suba
    (4, 1),
    -- Plomería en Bosa
    (5, 3),
    -- Electricidad en Chapinero
    (6, 2),
    -- Pintura en Suba
    (7, 3);
-- Mantenimiento en Chapinero

SELECT servicios.Ser_Nombre
FROM servicios INNER JOIN servicios_manzanas ON 
servicios_manzanas.FK_ID_Servicios=servicios.ID_Servicios INNER JOIN manzanas ON
 manzanas.ID_Manzanas=servicios_manzanas.FK_ID_Manzanas INNER JOIN usuario ON
 manzanas.ID_Manzanas=usuario.FK_ID_Manzanas
WHERE usuario.Usu_NombreCompleto="brian";

-- Insertar un Administrador
INSERT INTO Usuario (Usu_TipoUsuario, Usu_TipoDocumento, Usu_NumeroDocumento, Usu_NombreCompleto, Usu_Telefono, Usu_CorreoElectronico, Usu_Direccion, Usu_Ocupacion, FK_ID_Manzanas)
VALUES ('Administrador', 'CC', 1234567890, 'Carlos Pérez', '3001234567', 'carlos.perez@example.com', 'Calle 10 #20-30', 'Ingeniero', 1);

-- Insertar otro Administrador
INSERT INTO Usuario (Usu_TipoUsuario, Usu_TipoDocumento, Usu_NumeroDocumento, Usu_NombreCompleto, Usu_Telefono, Usu_CorreoElectronico, Usu_Direccion, Usu_Ocupacion, FK_ID_Manzanas)
VALUES ('Administrador', 'TI', 1098765432, 'Ana Gómez', '3007654321', 'ana.gomez@example.com', 'Carrera 15 #45-60', 'Analista', 2);

-- Insertar un Usuario
INSERT INTO Usuario (Usu_TipoUsuario, Usu_TipoDocumento, Usu_NumeroDocumento, Usu_NombreCompleto, Usu_Telefono, Usu_CorreoElectronico, Usu_Direccion, Usu_Ocupacion, FK_ID_Manzanas)
VALUES ('Usuario', 'CC', 1122334455, 'Juan López', '3101234567', 'juan.lopez@example.com', 'Avenida 5 #10-15', 'Docente', 3);

-- Insertar otro Usuario
INSERT INTO Usuario (Usu_TipoUsuario, Usu_TipoDocumento, Usu_NumeroDocumento, Usu_NombreCompleto, Usu_Telefono, Usu_CorreoElectronico, Usu_Direccion, Usu_Ocupacion, FK_ID_Manzanas)
VALUES ('Usuario', 'TI', 2233445566, 'Laura Martínez', '3107654321', 'laura.martinez@example.com', 'Calle 25 #30-40', 'Estudiante', 4);

-- Insertar un usuario sin tipo definido
INSERT INTO Usuario (Usu_TipoUsuario, Usu_TipoDocumento, Usu_NumeroDocumento, Usu_NombreCompleto, Usu_Telefono, Usu_CorreoElectronico, Usu_Direccion, Usu_Ocupacion, FK_ID_Manzanas)
VALUES ('Administrador', 'CC', 3344556677, 'Pedro Ramírez', '3201234567', 'pedro.ramirez@example.com', 'Carrera 50 #20-25', 'Comerciante', 5);


INSERT INTO Manzanas
    (Man_Nombre, Man_Direccion)
VALUES
    ('Soacha', 'Calle Falsa 231')