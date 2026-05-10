const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Account = require('../models/Account');

router.use(auth);

// GET
router.get('/me', async (req, res) => {
  try {
    const account = req.account;
    res.json({
      accountId: account.id,
      user: account.user,
      balance: account.balance,
      transactionCount: account.transactions.length
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

// GET
router.get('/balance', async (req, res) => {
  try {
    res.json({ balance: req.account.balance });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

// GET /api/account/history
router.get('/history', async (req, res) => {
  try {
    const transactions = [...req.account.transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

// POST
router.post('/deposit', async (req, res) => {
  try {
    const { amount } = req.body;

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: 'Monto inválido' });
    }

    const account = req.account;
    account.balance += numericAmount;
    account.transactions.push({ type: 'Depósito', amount: numericAmount });
    await account.save();

    res.json({
      message: 'Depósito exitoso',
      newBalance: account.balance
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

// POST
router.post('/withdraw', async (req, res) => {
  try {
    const { amount } = req.body;

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: 'Monto inválido' });
    }

    const account = req.account;
    if (account.balance < numericAmount) {
      return res.status(400).json({ message: 'Fondos insuficientes' });
    }

    account.balance -= numericAmount;
    account.transactions.push({ type: 'Retiro', amount: numericAmount });
    await account.save();

    res.json({
      message: 'Retiro exitoso',
      newBalance: account.balance
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

// POST
router.post('/transfer', async (req, res) => {
  try {
    const { recipientUsername, amount, description } = req.body;
    const sender = req.account;

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: 'Monto inválido' });
    }

    if (!recipientUsername || typeof recipientUsername !== 'string') {
      return res.status(400).json({ message: 'Destinatario inválido' });
    }

    const trimmedRecipient = recipientUsername.trim();

    if (trimmedRecipient === sender.user) {
      return res.status(400).json({ message: 'No podés transferirte a vos mismo' });
    }

    if (sender.balance < numericAmount) {
      return res.status(400).json({ message: 'Fondos insuficientes' });
    }

    const recipient = await Account.findOne({ user: trimmedRecipient });
    if (!recipient) {
      return res.status(404).json({ message: 'Destinatario no encontrado' });
    }

    const cleanDescription = (description ?? '').toString().trim().slice(0, 200);

    sender.balance -= numericAmount;
    sender.transactions.push({
      type: 'Transferencia enviada',
      amount: numericAmount,
      counterpartyUsername: recipient.user,
      description: cleanDescription
    });

    recipient.balance += numericAmount;
    recipient.transactions.push({
      type: 'Transferencia recibida',
      amount: numericAmount,
      counterpartyUsername: sender.user,
      description: cleanDescription
    });

    await sender.save();
    await recipient.save();

    res.json({
      message: 'Transferencia exitosa',
      newBalance: sender.balance,
      recipient: recipient.user,
      amount: numericAmount
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

// ──────────────────────────────────────────────────────────────
// FAVORITOS
// ──────────────────────────────────────────────────────────────

// GET
router.get('/favorites', async (req, res) => {
  try {
    res.json({ favorites: req.account.favorites });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

// POST
router.post('/favorites', async (req, res) => {
  try {
    const { username } = req.body;
    const account = req.account;

    if (!username || typeof username !== 'string') {
      return res.status(400).json({ message: 'Usuario inválido' });
    }

    const trimmed = username.trim();

    if (!trimmed) {
      return res.status(400).json({ message: 'Usuario inválido' });
    }

    if (trimmed === account.user) {
      return res.status(400).json({ message: 'No podés agregarte a vos mismo como favorito' });
    }

    if (account.favorites.includes(trimmed)) {
      return res.status(400).json({ message: 'El usuario ya está en favoritos' });
    }

    const target = await Account.findOne({ user: trimmed });
    if (!target) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    account.favorites.push(target.user);
    await account.save();

    res.json({
      message: 'Favorito agregado',
      favorites: account.favorites
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

// DELETE
router.delete('/favorites/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const account = req.account;

    const trimmed = (username ?? '').trim();
    if (!trimmed) {
      return res.status(400).json({ message: 'Usuario inválido' });
    }

    const before = account.favorites.length;
    account.favorites = account.favorites.filter((u) => u !== trimmed);

    if (account.favorites.length === before) {
      return res.status(404).json({ message: 'Favorito no encontrado' });
    }

    await account.save();

    res.json({
      message: 'Favorito eliminado',
      favorites: account.favorites
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

module.exports = router;