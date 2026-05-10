const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Depósito', 'Retiro', 'Transferencia enviada', 'Transferencia recibida'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  counterpartyUsername: {
    type: String,
    default: null
  },
  description: {
    type: String,
    default: '',
    maxlength: 200
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const accountSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  pin: {
    type: String,
    required: true
  },
  balance: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  transactions: [transactionSchema],
  favorites: {
    type: [String],
    default: []
  }
}, { timestamps: true });

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;