const mongoose = require("mongoose");

const cache = globalThis.__warehouseMongoCache || {
  connection: null,
  promise: null,
  uri: null,
};

globalThis.__warehouseMongoCache = cache;

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is required");
  mongoose.set("strictQuery", true);

  if (mongoose.connection.readyState === 1) {
    cache.connection = mongoose.connection;
    cache.uri = uri;
    return cache.connection;
  }

  if (cache.uri !== uri) {
    cache.connection = null;
    cache.promise = null;
    cache.uri = uri;
  } else if (mongoose.connection.readyState === 0 && cache.connection) {
    cache.connection = null;
    cache.promise = null;
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(uri)
      .then((connection) => {
        cache.connection = connection.connection;
        console.log(`MongoDB connected: ${connection.connection.host}/${connection.connection.name}`);
        return cache.connection;
      })
      .catch((error) => {
        cache.promise = null;
        throw error;
      });
  }

  return cache.promise;
}

module.exports = connectDB;