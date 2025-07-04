const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

connectDB();

const app = express();
app.use(cors());

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'La API del Cajero ATM está funcionando' });
});

app.use('/api/auth', require('./routes/auth'));

app.use('/api/account', require('./routes/account'));

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});