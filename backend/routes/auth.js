const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Account = require('../models/Account');

// Register
router.post('/register', async (req, res) => {
    try {
        const { user, pin, balance } = req.body;

        let account = await Account.findOne({ user });
        if (account) {
            return res.status(400).json({ message: 'El nombre de usuario ya existe' });
        }

        account = new Account({
            user,
            pin,
            balance
        });

        const salt = await bcrypt.genSalt(10);
        account.pin = await bcrypt.hash(pin, salt);

        await account.save();

        res.status(201).json({ message: 'Cuenta registrada exitosamente' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        
        const { user, pin } = req.body;

        const account = await Account.findOne({ user });
        if (!account) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }

        const isMatch = await bcrypt.compare(pin, account.pin);
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }

        res.json({ message: 'Login exitoso', accountId: account.id });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

module.exports = router;