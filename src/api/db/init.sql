-- Script para crear la base de datos y tabla principal
CREATE DATABASE LoomiFinCore;
GO
USE LoomiFinCore;
GO
CREATE TABLE Invoices (
    id INT IDENTITY(1,1) PRIMARY KEY,
    cliente NVARCHAR(100) NOT NULL,
    descripcion NVARCHAR(255) NOT NULL,
    oficio NVARCHAR(100) NOT NULL,
    monto DECIMAL(18,2) NOT NULL,
    metodo NVARCHAR(50) NOT NULL,
    fecha DATE NOT NULL,
    vencimiento DATE NOT NULL
);
