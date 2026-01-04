const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');
const ShoppingList = require('./models/ShoppingList');

const app = express();
app.use(cors());
app.use(express.json());

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim() !== '';
}

function isValidQuantity(v) {
  return typeof v === 'number' && Number.isFinite(v) && v >= 0;
}

// GET /lists
app.get('/lists', async (req, res) => {
  try {
    const { owner } = req.query;
    const filter = owner ? { owner } : {};
    const lists = await ShoppingList.find(filter).select('-_id -__v -items._id');
    res.json(lists);
  } catch (error) {
    res.status(500).json({ error: { code: 'internal_error', message: error.message } });
  }
});

// POST /lists
app.post('/lists', async (req, res) => {
  try {
    const { name, owner } = req.body || {};
    if (!isNonEmptyString(name)) {
      return res.status(400).json({ error: { code: 'validation_failed', message: 'name is required and must be a non-empty string' } });
    }
    const newList = new ShoppingList({
      id: nanoid(),
      name: name.trim(),
      owner: isNonEmptyString(owner) ? owner.trim() : null,
      items: []
    });
    await newList.save();
    const response = newList.toObject();
    delete response._id;
    delete response.__v;
    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ error: { code: 'internal_error', message: error.message } });
  }
});

// GET /lists/:id
app.get('/lists/:id', async (req, res) => {
  try {
    const list = await ShoppingList.findOne({ id: req.params.id }).select('-_id -__v -items._id');
    if (!list) return res.status(404).json({ error: { code: 'not_found', message: 'List not found' } });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: { code: 'internal_error', message: error.message } });
  }
});

// PATCH /lists/:id
app.patch('/lists/:id', async (req, res) => {
  try {
    const list = await ShoppingList.findOne({ id: req.params.id });
    if (!list) return res.status(404).json({ error: { code: 'not_found', message: 'List not found' } });

    const { name, owner } = req.body || {};

    if (name !== undefined) {
      if (!isNonEmptyString(name)) {
        return res.status(400).json({ error: { code: 'validation_failed', message: 'name must be a non-empty string' } });
      }
      list.name = name.trim();
    }
    if (owner !== undefined) {
      list.owner = isNonEmptyString(owner) ? owner.trim() : null;
    }

    await list.save();
    const response = list.toObject();
    delete response._id;
    delete response.__v;
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: { code: 'internal_error', message: error.message } });
  }
});

// DELETE /lists/:id
app.delete('/lists/:id', async (req, res) => {
  try {
    const result = await ShoppingList.deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: { code: 'not_found', message: 'List not found' } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: { code: 'internal_error', message: error.message } });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: { code: 'not_found', message: 'Route not found' } });
});

module.exports = app;
