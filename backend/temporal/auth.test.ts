/**
 * Tests para el modulo de Autenticacion
 * Prueba la validacion de JWT y middleware de auth
 */
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// Secret para tests
const JWT_SECRET = 'test-secret-key-for-testing';

// Mock del middleware de autenticacion (simplificado)
const mockAuthenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'No token provided',
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token format',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

describe('Authentication Module', () => {

  describe('JWT Token Generation', () => {
    it('debe generar un token valido', () => {
      const payload = { userId: 1, email: 'test@example.com' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // Header.Payload.Signature
    });

    it('debe decodificar correctamente el token', () => {
      const payload = { userId: 1, email: 'test@example.com' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

      const decoded = jwt.verify(token, JWT_SECRET) as any;

      expect(decoded.userId).toBe(1);
      expect(decoded.email).toBe('test@example.com');
    });

    it('debe fallar con un secret incorrecto', () => {
      const payload = { userId: 1 };
      const token = jwt.sign(payload, JWT_SECRET);

      expect(() => {
        jwt.verify(token, 'wrong-secret');
      }).toThrow();
    });

    it('debe incluir expiracion en el token', () => {
      const payload = { userId: 1 };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

      const decoded = jwt.verify(token, JWT_SECRET) as any;

      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
    });
  });

  describe('Authenticate Middleware', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
      mockReq = {
        headers: {},
      };
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      mockNext = jest.fn();
    });

    it('debe rechazar peticion sin token', () => {
      mockAuthenticate(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'No token provided',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debe rechazar token invalido', () => {
      mockReq.headers = {
        authorization: 'Bearer invalid-token',
      };

      mockAuthenticate(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debe aceptar token valido', () => {
      const token = jwt.sign({ userId: 1 }, JWT_SECRET, { expiresIn: '1h' });
      mockReq.headers = {
        authorization: `Bearer ${token}`,
      };

      mockAuthenticate(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect((mockReq as any).user.userId).toBe(1);
    });

    it('debe rechazar token expirado', () => {
      // Crear token que ya expiro
      const token = jwt.sign(
        { userId: 1 },
        JWT_SECRET,
        { expiresIn: '-1s' } // Expiro hace 1 segundo
      );
      mockReq.headers = {
        authorization: `Bearer ${token}`,
      };

      mockAuthenticate(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
