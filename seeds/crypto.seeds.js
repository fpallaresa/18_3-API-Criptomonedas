const mongoose = require("mongoose");
const { connect } = require("../db.js");
const { cryptoSeed } = require("./crypto.seeds.aux.js");

const seed = async () => {
  try {
    await connect();
    console.log("tenemos conexión");
    await cryptoSeed();
  } catch (error) {
    console.log(error);
  } finally {
    mongoose.disconnect();
  }
};

seed();
