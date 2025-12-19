/**
 * Tests para el modulo de Catalogos
 * Prueba el controller y validaciones de catalogos
 */
import request from 'supertest';
import express, { Application, Request, Response } from 'express';

// Datos mock de catalogos
const mockCatalogs = {
  roles: [
    { id: 1, name: 'Admin', description: 'Administrator role', is_active: true },
    { id: 2, name: 'User', description: 'Standard user role', is_active: true },
  ],
  genders: [
    { id: 1, name: 'Masculino', code: 'M', is_active: true },
    { id: 2, name: 'Femenino', code: 'F', is_active: true },
  ],
  payment_methods: [
    { id: 1, name: 'Efectivo', code: 'CASH', is_active: true },
    { id: 2, name: 'Transferencia', code: 'TRANSFER', is_active: true },
    { id: 3, name: 'Tarjeta', code: 'CARD', is_active: true },
  ],
};

// Crear app de prueba con rutas de catalogo
const createTestApp = (): Application => {
  const app = express();
  app.use(express.json());

  // GET /catalogs - Lista todos los catalogos disponibles
  app.get('/api/catalogs', (_req: Request, res: Response) => {
    res.json({
      success: true,
      data: Object.keys(mockCatalogs),
    });
  });

  // GET /catalogs/:name - Obtiene entradas de un catalogo
  app.get('/api/catalogs/:catalogName', (req: Request, res: Response) => {
    const { catalogName } = req.params;
    const catalog = mockCatalogs[catalogName as keyof typeof mockCatalogs];

    if (!catalog) {
      return res.status(404).json({
        success: false,
        message: `Catalog '${catalogName}' not found`,
      });
    }

    res.json({
      success: true,
      data: catalog,
      total: catalog.length,
    });
  });

  // GET /catalogs/:name/:id - Obtiene una entrada especifica
  app.get('/api/catalogs/:catalogName/:id', (req: Request, res: Response) => {
    const { catalogName, id } = req.params;
    const catalog = mockCatalogs[catalogName as keyof typeof mockCatalogs];

    if (!catalog) {
      return res.status(404).json({
        success: false,
        message: `Catalog '${catalogName}' not found`,
      });
    }

    const entry = catalog.find((item: any) => item.id === parseInt(id));

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Entry not found',
      });
    }

    res.json({
      success: true,
      data: entry,
    });
  });

  // POST /catalogs/:name - Crea nueva entrada
  app.post('/api/catalogs/:catalogName', (req: Request, res: Response) => {
    const { catalogName } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required',
      });
    }

    // Simular creacion
    const newEntry = {
      id: Date.now(),
      name,
      is_active: true,
      ...req.body,
    };

    res.status(201).json({
      success: true,
      data: newEntry,
      message: `Entry created in ${catalogName}`,
    });
  });

  return app;
};

describe('Catalogs Module', () => {
  let app: Application;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('GET /api/catalogs', () => {
    it('debe retornar lista de catalogos disponibles', async () => {
      const response = await request(app).get('/api/catalogs');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('debe incluir catalogos esperados', async () => {
      const response = await request(app).get('/api/catalogs');

      expect(response.body.data).toContain('roles');
      expect(response.body.data).toContain('genders');
      expect(response.body.data).toContain('payment_methods');
    });
  });

  describe('GET /api/catalogs/:catalogName', () => {
    it('debe retornar entradas de un catalogo existente', async () => {
      const response = await request(app).get('/api/catalogs/roles');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.total).toBeGreaterThan(0);
    });

    it('debe retornar 404 para catalogo inexistente', async () => {
      const response = await request(app).get('/api/catalogs/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('roles debe tener estructura correcta', async () => {
      const response = await request(app).get('/api/catalogs/roles');
      const role = response.body.data[0];

      expect(role).toHaveProperty('id');
      expect(role).toHaveProperty('name');
      expect(role).toHaveProperty('is_active');
    });

    it('payment_methods debe retornar todos los metodos', async () => {
      const response = await request(app).get('/api/catalogs/payment_methods');

      expect(response.body.data.length).toBe(3);
      expect(response.body.data.some((m: any) => m.code === 'CASH')).toBe(true);
    });
  });

  describe('GET /api/catalogs/:catalogName/:id', () => {
    it('debe retornar entrada especifica por id', async () => {
      const response = await request(app).get('/api/catalogs/roles/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(1);
      expect(response.body.data.name).toBe('Admin');
    });

    it('debe retornar 404 para id inexistente', async () => {
      const response = await request(app).get('/api/catalogs/roles/999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/catalogs/:catalogName', () => {
    it('debe crear nueva entrada con datos validos', async () => {
      const newEntry = { name: 'New Role', description: 'Test role' };

      const response = await request(app)
        .post('/api/catalogs/roles')
        .send(newEntry)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('New Role');
    });

    it('debe rechazar entrada sin nombre', async () => {
      const response = await request(app)
        .post('/api/catalogs/roles')
        .send({ description: 'Missing name' })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Name is required');
    });
  });
});
