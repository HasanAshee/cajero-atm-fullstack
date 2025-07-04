const express = require('express');
const router = express.Router();
const Account = require('../models/Account');

router.post('/balance', async (req, res) => {
    try {
        const { accountId } = req.body;
        const account = await Account.findById(accountId);
        if (!account) {
            return res.status(404).json({ message: 'Cuenta no encontrada' });
        }
        res.json({ balance: account.balance });
    } catch (err) {
        res.status(500).send('Error en el servidor');
    }
});

router.post('/withdraw', async (req, res) => {
    try {
        const { accountId, amount } = req.body;
        const account = await Account.findById(accountId);
        if (!account) {
            return res.status(404).json({ message: 'Cuenta no encontrada' });
        }
        if (account.balance < amount) {
            return res.status(400).json({ message: 'Fondos insuficientes' });
        }
        account.balance -= amount;
        account.transactions.push({ type: 'Retiro', amount });
        await account.save();
        res.json({ message: 'Retiro exitoso', newBalance: account.balance });
    } catch (err) {
        res.status(500).send('Error en el servidor');
    }
});

router.post('/deposit', async (req, res) => {
    try {
        const { accountId, amount } = req.body;
        const account = await Account.findById(accountId);
        if (!account) {
            return res.status(404).json({ message: 'Cuenta no encontrada' });
        }
        account.balance += amount;
        account.transactions.push({ type: 'Depósito', amount });
        await account.save();
        res.json({ message: 'Depósito exitoso', newBalance: account.balance });
    } catch (err) {
        res.status(500).send('Error en el servidor');
    }
});

router.post('/history', async (req, res) => {
    try {
        const { accountId } = req.body;
        const account = await Account.findById(accountId);
        if (!account) {
            return res.status(404).json({ message: 'Cuenta no encontrada' });
        }
        res.json(account.transactions);
    } catch (err) {
        res.status(500).send('Error en el servidor');
    }
});

module.exports = router;