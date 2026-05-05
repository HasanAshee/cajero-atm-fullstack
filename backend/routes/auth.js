const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Account = require('../models/Account');

// Helper
const generateToken = (accountId) => {
  return jwt.sign(
    { accountId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { user, pin, balance } = req.body;

    if (!user || !pin) {
      return res.status(400).json({ message: 'Usuario y PIN son obligatorios' });
    }

    let account = await Account.findOne({ user });
    if (account) {
      return res.status(400).json({ message: 'El nombre de usuario ya existe' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPin = await bcrypt.hash(pin, salt);

    account = new Account({
      user,
      pin: hashedPin,
      balance: balance ?? 0
    });

    await account.save();

    const token = generateToken(account.id);

    res.status(201).json({
      message: 'Cuenta registrada exitosamente',
      token,
      user: account.user,
      accountId: account.id
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { user, pin } = req.body;

    if (!user || !pin) {
      return res.status(400).json({ message: 'Usuario y PIN son obligatorios' });
    }

    const account = await Account.findOne({ user });
    if (!account) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    const isMatch = await bcrypt.compare(pin, account.pin);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    const token = generateToken(account.id);

    res.json({
      message: 'Login exitoso',
      token,
      user: account.user,
      accountId: account.id
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

module.exports = router;