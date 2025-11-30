const express = require('express');
const cors = require('cors');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const { nanoid } = require('nanoid');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// file DB (db.json bude v kořeni projektu)
const dbFile = path.join(__dirname, '..', 'db.json');
const adapter = new JSONFile(dbFile);

// IMPORTANT: pass default data as second argument to Low to avoid "missing default data" error
const db = new Low(adapter, { lists: [] });

async function initDB() {
  // read existing file (if any) and ensure db.data exists
  await db.read();
  db.data = db.data || { lists: [] };
  await db.write();
}
initDB();

// Helpers
async function ensureDB() {
  await db.read();
  db.data = db.data || { lists: [] };
}

function findList(id) {
  if (!db.data || !Array.isArray(db.data.lists)) return undefined;
  return db.data.lists.find(l => l.id === id);
}

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim() !== '';
}

function isValidQuantity(v) {
  return typeof v === 'number' && Number.isFinite(v) && v >= 0;
}

// --- Endpoints (plain REST, manual validation) ---

// GET /lists - všechny seznamy (volitelně filtrovat podle owner query param)
app.get('/lists', async (req, res) => {
  await ensureDB();
  const { owner } = req.query;
  let lists = db.data.lists;
  if (owner) lists = lists.filter(l => l.owner === owner);
  res.json(lists);
});

// POST /lists - vytvořit nový seznam
app.post('/lists', async (req, res) => {
  const { name, owner } = req.body || {};
  if (!isNonEmptyString(name)) {
    return res.status(400).json({ error: { code: 'validation_failed', message: 'name is required and must be a non-empty string' } });
  }
  await ensureDB();
  const newList = { id: nanoid(), name: name.trim(), owner: isNonEmptyString(owner) ? owner.trim() : null, items: [] };
  db.data.lists.push(newList);
  await db.write();
  res.status(201).json(newList);
});

// GET /lists/:id - detail seznamu
app.get('/lists/:id', async (req, res) => {
  await ensureDB();
  const list = findList(req.params.id);
  if (!list) return res.status(404).json({ error: { code: 'not_found', message: 'List not found' } });
  res.json(list);
});

// POST /lists/:id/items - přidat položku do seznamu
app.post('/lists/:id/items', async (req, res) => {
  const { name, quantity } = req.body || {};
  if (!isNonEmptyString(name)) {
    return res.status(400).json({ error: { code: 'validation_failed', message: 'name is required and must be a non-empty string' } });
  }
  if (quantity !== undefined && !isValidQuantity(quantity)) {
    return res.status(400).json({ error: { code: 'validation_failed', message: 'quantity must be a non-negative number when provided' } });
  }
  await ensureDB();
  const list = findList(req.params.id);
  if (!list) return res.status(404).json({ error: { code: 'list_not_found', message: 'List not found' } });
  const item = { id: nanoid(), name: name.trim(), quantity: quantity !== undefined ? quantity : 1, checked: false };
  list.items.push(item);
  await db.write();
  res.status(201).json(item);
});

// PATCH /lists/:id/items/:itemId - aktualizace položky (částečná)
app.patch('/lists/:id/items/:itemId', async (req, res) => {
  await ensureDB();
  const list = findList(req.params.id);
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

  await db.write();
  res.json(item);
});

// DELETE /lists/:id/items/:itemId - smazat položku
app.delete('/lists/:id/items/:itemId', async (req, res) => {
  await ensureDB();
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
  await ensureDB();
  const before = db.data.lists.length;
  db.data.lists = db.data.lists.filter(l => l.id !== req.params.id);
  if (db.data.lists.length === before) return res.status(404).json({ error: { code: 'not_found', message: 'List not found' } });
  await db.write();
  res.status(204).send();
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));