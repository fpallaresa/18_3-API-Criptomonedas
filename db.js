// Cargamos variables de entorno
require("dotenv").config();
const DB_CONNECTION = process.env.DB_URL;

const mongoose = require("mongoose");

// Configuración de la conexión
const config = {
  serverSelectionTimeoutMS: 5000,
  dbName: "Crypto",
};

async function connect() {
  const database = await mongoose.connect(DB_CONNECTION, config);
  const name = database.connection.name;
  const host = database.connection.host;
  console.log(`Connected on database ${name} on host ${host}`);
}

module.exports = { connect };
