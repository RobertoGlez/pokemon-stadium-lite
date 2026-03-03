# B-US-01: Configuración del Servidor y Base de Datos

**Estado:** [x] DONE

## Descripción
Como sistema, necesito una capa base en Node.js que escuche en el puerto 8080 en `0.0.0.0` y que mantenga conexión persistente a una base de datos de MongoDB con los esquemas de Player, Lobby y Battle de acuerdo a Clean Architecture.

## Tareas (Tasks)
- [x] T1: Configurar servidor Fastify/Express exponiendo puerto 8080 host 0.0.0.0.
- [x] T2: Configurar MongoDB a través de Mongoose.
- [x] T3: Crear los Schemas correspondientes para las entidades del dominio.

## Criterios de Aceptación (Entregables)
- Servidor compila e inicia sin errores mostrando log con "Listening on 0.0.0.0:8080".
- Mongo DB muestra conexión lograda. Los Cors están completamente abiertos para testeo.
