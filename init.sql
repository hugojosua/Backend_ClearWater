CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE rol_enum AS ENUM ('admin', 'cliente');
CREATE TYPE pago_enum AS ENUM ('efectivo', 'transferencia');

CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rol rol_enum NOT NULL DEFAULT 'cliente',
    nombre VARCHAR(100) NOT NULL,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    direccion VARCHAR(255),
    password VARCHAR(255), 
    usa_app BOOLEAN DEFAULT TRUE
);

CREATE TABLE recargas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metodo_pago pago_enum NOT NULL,
    es_promocion BOOLEAN DEFAULT FALSE
);

CREATE TABLE productos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    imagen_url VARCHAR(255)
);

CREATE TABLE publicidad (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo VARCHAR(100) NOT NULL,
    imagen_url VARCHAR(255),
    activa BOOLEAN DEFAULT TRUE
);

CREATE TABLE notificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    mensaje TEXT NOT NULL,
    leida BOOLEAN DEFAULT FALSE,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);