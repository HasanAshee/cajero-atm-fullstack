const mongoose = require('mongoose');

const dbURI = process.env.DB_URI;
   

const connectDB = async () => {
  try {
    await mongoose.connect(dbURI);
    console.log('MongoDB conectado exitosamente...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;