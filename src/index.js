const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');
const connectDB = require('./config/database');
const ShoppingList = require('./models/ShoppingList');

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.get('/', (req, res) => res.send('Server is running'));

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim() !== '';
}

function isValidQuantity(v) {
  return typeof v === 'number' && Number.isFinite(v) && v >= 0;
}

// GET /lists - všechny seznamy
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

// POST /lists - vytvořit nový seznam
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

// GET /lists/:id - detail seznamu
app.get('/lists/:id', async (req, res) => {
  try {
    const list = await ShoppingList.findOne({ id: req.params.id }).select('-_id -__v -items._id');
    if (!list) return res.status(404).json({ error: { code: 'not_found', message: 'List not found' } });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: { code: 'internal_error', message: error.message } });
  }
});

// PATCH /lists/:id - aktualizovat seznam
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

// POST /lists/:id/items - přidat položku do seznamu
app.post('/lists/:id/items', async (req, res) => {
  try {
    const { name, quantity } = req.body || {};
    if (!isNonEmptyString(name)) {
      return res.status(400).json({ error: { code: 'validation_failed', message: 'name is required and must be a non-empty string' } });
    }
    if (quantity !== undefined && !isValidQuantity(quantity)) {
      return res.status(400).json({ error: { code: 'validation_failed', message: 'quantity must be a non-negative number when provided' } });
    }
    const list = await ShoppingList.findOne({ id: req.params.id });
    if (!list) return res.status(404).json({ error: { code: 'list_not_found', message: 'List not found' } });
    const item = { id: nanoid(), name: name.trim(), quantity: quantity !== undefined ? quantity : 1, checked: false };
    list.items.push(item);
    await list.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: { code: 'internal_error', message: error.message } });
  }
});

// PATCH /lists/:id/items/:itemId - aktualizace položky (částečná)
app.patch('/lists/:id/items/:itemId', async (req, res) => {
  try {
    const list = await ShoppingList.findOne({ id: req.params.id });
    if (!list) return res.status(404).json({ error: { code: 'list_not_found', message: 'List not found' } });
    const item = list.items.find(it => it.id === req.params.itemId);
    if (!item) return res.status(404).json({ error: { code: 'item_not_found', message: 'Item not found' } });

    const { name, quantity, checked } = req.body || {};

    if (name !== undefined) {
      if (!isNonEmptyString(name)) {
        return res.status(400).json({ error: { code: 'validation_failed', message: 'name must be a non-empty string' } });
      }
      item.name = name.trim();
    }
    if (quantity !== undefined) {
      if (!isValidQuantity(quantity)) {
        return res.status(400).json({ error: { code: 'validation_failed', message: 'quantity must be a non-negative number' } });
      }
      item.quantity = quantity;
    }
    if (checked !== undefined) {
      item.checked = !!checked;
    }

    await list.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: { code: 'internal_error', message: error.message } });
  }
});

// DELETE /lists/:id/items/:itemId - smazat položku
app.delete('/lists/:id/items/:itemId', async (req, res) => {
  try {
    const list = await ShoppingList.findOne({ id: req.params.id });
    if (!list) return res.status(404).json({ error: { code: 'list_not_found', message: 'List not found' } });
    const before = list.items.length;
    list.items = list.items.filter(it => it.id !== req.params.itemId);
    if (list.items.length === before) {
      return res.status(404).json({ error: { code: 'item_not_found', message: 'Item not found' } });
    }
    await list.save();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: { code: 'internal_error', message: error.message } });
  }
});

// Volitelně: smazat celý seznam
app.delete('/lists/:id', async (req, res) => {
  try {
    const result = await ShoppingList.deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: { code: 'not_found', message: 'List not found' } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: { code: 'internal_error', message: error.message } });
  }
});

// Handle undefined routes with 404
app.use((req, res) => {
  res.status(404).json({ error: { code: 'not_found', message: 'Route not found' } });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));