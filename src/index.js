const express = require('express');
const cors = require('cors');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const { nanoid } = require('nanoid');
const { body, validationResult } = require('express-validator');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// file DB (db.json bude v kořeni projektu)
const dbFile = path.join(__dirname, '..', 'db.json');
const adapter = new JSONFile(dbFile);
const db = new Low(adapter);

async function initDB() {
  await db.read();
  db.data = db.data || { lists: [] };
  await db.write();
}
initDB();

// Helper
function findList(id) {
  return db.data.lists.find(l => l.id === id);
}

// GET /lists - všechny seznamy (volitelně filtrovat podle owner query param)
app.get('/lists', async (req, res) => {
  await db.read();
  const { owner } = req.query;
  let lists = db.data.lists;
  if (owner) lists = lists.filter(l => l.owner === owner);
  res.json(lists);
});

// POST /lists - vytvořit nový seznam
app.post(
  '/lists',
  body('name').isString().notEmpty().withMessage('name is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: { code: 'validation_failed', details: errors.array() } });
    }
    await db.read();
    const { name, owner } = req.body;
    const newList = { id: nanoid(), name, owner: owner || null, items: [] };
    db.data.lists.push(newList);
    await db.write();
    res.status(201).json(newList);
  }
);

// GET /lists/:id - detail seznamu
app.get('/lists/:id', async (req, res) => {
  await db.read();
  const list = findList(req.params.id);
  if (!list) return res.status(404).json({ error: { code: 'not_found', message: 'List not found' } });
  res.json(list);
});

// POST /lists/:id/items - přidat položku do seznamu
app.post(
  '/lists/:id/items',
  body('name').isString().notEmpty().withMessage('name is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: { code: 'validation_failed', details: errors.array() } });
    }
    await db.read();
    const list = findList(req.params.id);
    if (!list) return res.status(404).json({ error: { code: 'list_not_found', message: 'List not found' } });
    const { name, quantity } = req.body;
    const item = { id: nanoid(), name, quantity: quantity || 1, checked: false };
    list.items.push(item);
    await db.write();
    res.status(201).json(item);
  }
);

// PATCH /lists/:id/items/:itemId - aktualizace položky (částečná)
app.patch('/lists/:id/items/:itemId', async (req, res) => {
  await db.read();
  const list = findList(req.params.id);
  if (!list) return res.status(404).json({ error: { code: 'list_not_found', message: 'List not found' } });
  const item = list.items.find(it => it.id === req.params.itemId);
  if (!item) return res.status(404).json({ error: { code: 'item_not_found', message: 'Item not found' } });

  const { name, quantity, checked } = req.body;
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: { code: 'validation_failed', message: 'name must be non-empty string' } });
    }
    item.name = name;
  }
  if (quantity !== undefined) {
    if (!Number.isFinite(quantity) || quantity < 0) {
      return res.status(400).json({ error: { code: 'validation_failed', message: 'quantity must be a non-negative number' } });
    }
    item.quantity = quantity;
  }
  if (checked !== undefined) {
    item.checked = !!checked;
  }

  await db.write();
  res.json(item);
});

// DELETE /lists/:id/items/:itemId - smazat položku
app.delete('/lists/:id/items/:itemId', async (req, res) => {
  await db.read();
  const list = findList(req.params.id);
  if (!list) return res.status(404).json({ error: { code: 'list_not_found', message: 'List not found' } });
  const before = list.items.length;
  list.items = list.items.filter(it => it.id !== req.params.itemId);
  if (list.items.length === before) {
    return res.status(404).json({ error: { code: 'item_not_found', message: 'Item not found' } });
  }
  await db.write();
  res.status(204).send();
});

// Volitelně: smazat celý seznam
app.delete('/lists/:id', async (req, res) => {
  await db.read();
  const before = db.data.lists.length;
  db.data.lists = db.data.lists.filter(l => l.id !== req.params.id);
  if (db.data.lists.length === before) return res.status(404).json({ error: { code: 'not_found', message: 'List not found' } });
  await db.write();
  res.status(204).send();
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));