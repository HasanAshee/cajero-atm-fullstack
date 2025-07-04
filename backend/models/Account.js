const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Retiro', 'Depósito'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const accountSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true
  },
  pin: {
    type: String,
    required: true
  },
  balance: {
    type: Number,
    required: true,
    default: 0
  },
  transactions: [transactionSchema]
});

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;