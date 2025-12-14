const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 0
  },
  checked: {
    type: Boolean,
    required: true,
    default: false
  }
}, { _id: false });

const shoppingListSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  owner: {
    type: String,
    trim: true,
    default: null
  },
  items: [itemSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('ShoppingList', shoppingListSchema);
