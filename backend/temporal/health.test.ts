/**
 * Tests para el endpoint de Health Check
 * Este es un test simple que no requiere autenticacion
 */
import request from 'supertest';
import express, { Application } from 'express';

// Crear una app de Express minimal para testing
const createTestApp = (): Application => {
  const app = express();
  app.use(express.json());

  // Health check endpoint (replica del original)
  app.get('/health', (_req, res) => {
    res.status(200).json({
      success: true,
      message: 'ERP Server is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  });

  return app;
};

describe('Health Check Endpoint', () => {
  let app: Application;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('GET /health', () => {
    it('debe retornar status 200', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
    });

    it('debe retornar success: true', async () => {
      const response = await request(app).get('/health');
      expect(response.body.success).toBe(true);
    });

    it('debe retornar el mensaje correcto', async () => {
      const response = await request(app).get('/health');
      expect(response.body.message).toBe('ERP Server is running');
    });

    it('debe retornar la version', async () => {
      const response = await request(app).get('/health');
      expect(response.body.version).toBe('1.0.0');
    });

    it('debe incluir timestamp', async () => {
      const response = await request(app).get('/health');
      expect(response.body.timestamp).toBeDefined();
      // Verificar que el timestamp es una fecha valida
      const date = new Date(response.body.timestamp);
      expect(date.getTime()).not.toBeNaN();
    });

    it('debe tener la estructura correcta', async () => {
      const response = await request(app).get('/health');
      expect(response.body).toMatchObject({
        success: expect.any(Boolean),
        message: expect.any(String),
        timestamp: expect.any(String),
        version: expect.any(String),
      });
    });
  });
});
