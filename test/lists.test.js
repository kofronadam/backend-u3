const request = require('supertest');

// Mock nanoid BEFORE importing the app
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'test-id-' + Date.now())
}));

// Mock ShoppingList BEFORE importing the app so routes use the mocked model
jest.mock('../src/models/ShoppingList', () => {
  const m = function (init) {
    Object.assign(this, init);
    this.save = jest.fn().mockResolvedValue(this);
    this.toObject = jest.fn().mockImplementation(() => {
      const obj = { ...this };
      delete obj.save;
      delete obj.toObject;
      return obj;
    });
  };
  m.find = jest.fn();
  m.findOne = jest.fn();
  m.deleteOne = jest.fn();
  return m;
});

const ShoppingList = require('../src/models/ShoppingList');
const app = require('../src/app');

describe('Lists API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /lists', () => {
    it('returns a list of lists (happy path)', async () => {
      const fakeLists = [{ id: '1', name: 'Groceries', owner: null, items: [] }];
      ShoppingList.find.mockReturnValue({ select: jest.fn().mockResolvedValue(fakeLists) });

      const res = await request(app).get('/lists');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(fakeLists);
      expect(ShoppingList.find).toHaveBeenCalledWith({});
    });

    it('supports owner filter', async () => {
      const fakeLists = [{ id: '2', name: 'Party', owner: 'alice', items: [] }];
      ShoppingList.find.mockReturnValue({ select: jest.fn().mockResolvedValue(fakeLists) });

      const res = await request(app).get('/lists').query({ owner: 'alice' });
      expect(res.status).toBe(200);
      expect(res.body).toEqual(fakeLists);
      expect(ShoppingList.find).toHaveBeenCalledWith({ owner: 'alice' });
    });
  });

  describe('GET /lists/:id', () => {
    it('returns single list when found', async () => {
      const fake = { id: '1', name: 'Groceries', owner: null, items: [] };
      ShoppingList.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(fake) });

      const res = await request(app).get('/lists/1');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(fake);
      expect(ShoppingList.findOne).toHaveBeenCalledWith({ id: '1' });
    });

    it('returns 404 when not found', async () => {
      ShoppingList.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

      const res = await request(app).get('/lists/xxx');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /lists', () => {
    it('creates a new list with valid input', async () => {
      const res = await request(app).post('/lists').send({ name: 'New', owner: 'bob' });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('New');
    });

    it('returns 400 when name is missing or empty', async () => {
      const res = await request(app).post('/lists').send({ owner: 'bob' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('PATCH /lists/:id', () => {
    it('updates a list when found and valid input', async () => {
      const mockInstance = new ShoppingList({ id: '1', name: 'Old', owner: null });
      ShoppingList.findOne.mockResolvedValue(mockInstance);

      const res = await request(app).patch('/lists/1').send({ name: 'Updated' });
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated');
      expect(ShoppingList.findOne).toHaveBeenCalledWith({ id: '1' });
    });

    it('returns 404 when list not found', async () => {
      ShoppingList.findOne.mockResolvedValue(null);
      const res = await request(app).patch('/lists/doesnotexist').send({ name: 'x' });
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('DELETE /lists/:id', () => {
    it('deletes a list when it exists', async () => {
      ShoppingList.deleteOne.mockResolvedValue({ deletedCount: 1 });
      const res = await request(app).delete('/lists/1');
      expect(res.status).toBe(204);
      expect(ShoppingList.deleteOne).toHaveBeenCalledWith({ id: '1' });
    });

    it('returns 404 when list does not exist', async () => {
      ShoppingList.deleteOne.mockResolvedValue({ deletedCount: 0 });
      const res = await request(app).delete('/lists/xxx');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
  });
});
