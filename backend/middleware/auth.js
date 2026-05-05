const jwt = require('jsonwebtoken');
const Account = require('../models/Account');

module.exports = async function (req, res, next) {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ message: 'Acceso denegado. Token no provisto.' });
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;

  if (!token) {
    return res.status(401).json({ message: 'Token mal formado.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const account = await Account.findById(decoded.accountId);
    if (!account) {
      return res.status(401).json({ message: 'Cuenta no encontrada.' });
    }

    req.account = account;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Sesión expirada. Iniciá sesión de nuevo.' });
    }
    return res.status(401).json({ message: 'Token inválido.' });
  }
};