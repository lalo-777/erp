/**
 * Setup file para Jest
 * Se ejecuta antes de cada archivo de test
 */

// Configurar variables de entorno para tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing';
process.env.PORT = '3001';

// Aumentar timeout para operaciones async
jest.setTimeout(10000);

// Limpiar mocks despues de cada test
afterEach(() => {
  jest.clearAllMocks();
});

// Mensaje de inicio
console.log('Test environment initialized');
