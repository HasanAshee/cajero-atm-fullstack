const mongoose = require('mongoose');

const dbURI = 'mongodb+srv://atm_user:iyQtDrRv9ROOrgPZ@cluster0.tywrrxs.mongodb.net/atm-db?retryWrites=true&w=majority&appName=Cluster0'
   
    //mongodb+srv://atm_user:<iyQtDrRv9ROOrgPZ>@cluster0.tywrrxs.mongodb.net/cajero-db?retryWrites=true&w=majority&appName=Cluster0';

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