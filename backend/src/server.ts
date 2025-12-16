import express, { Application } from 'express';
import cors from 'cors';
import { config } from './config/environment';
import { connectMySQL } from './config/mysql';
import { errorHandler, notFound } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/auth.routes';
import dashboardRoutes from './routes/dashboard.routes';
import customersRoutes from './routes/customers.routes';
import usersRoutes from './routes/users.routes';
import mlAnalysisRoutes from './routes/ml-analysis.routes';
import invoicesRoutes from './routes/invoices.routes';
import projectsRoutes from './routes/projects.routes';
import materialsRoutes from './routes/materials.routes';
import catalogRoutes from './routes/catalog.routes';
import filesRoutes from './routes/files.routes';
import notesRoutes from './routes/notes.routes';
import laborRoutes from './routes/labor.routes';
import warehouseRoutes from './routes/warehouse.routes';
import preInventoryRoutes from './routes/pre-inventory.routes';

const app: Application = express();

// Middleware
app.use(cors({
  origin: [config.corsOrigin, 'http://localhost:4200'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'ERP Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/ml-analysis', mlAnalysisRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/catalogs', catalogRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/labor', laborRoutes);
app.use('/api/warehouse', warehouseRoutes);
app.use('/api/pre-inventory', preInventoryRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectMySQL();

    app.listen(config.port, () => {
      console.log(`========================================`);
      console.log(`ERP Server running on port ${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
      console.log(`CORS Origin: ${config.corsOrigin}`);
      console.log(`========================================`);
      console.log(`Available API Modules:`);
      console.log(`  ✓ Authentication (/api/auth)`);
      console.log(`  ✓ Dashboard (/api/dashboard)`);
      console.log(`  ✓ Customers (/api/customers)`);
      console.log(`  ✓ Users (/api/users)`);
      console.log(`  ✓ Invoices (/api/invoices)`);
      console.log(`  ✓ Projects (/api/projects)`);
      console.log(`  ✓ Materials (/api/materials)`);
      console.log(`  ✓ Catalogs (/api/catalogs)`);
      console.log(`  ✓ Files (/api/files)`);
      console.log(`  ✓ Notes (/api/notes)`);
      console.log(`  ✓ Labor (/api/labor)`);
      console.log(`  ✓ Warehouse (/api/warehouse)`);
      console.log(`  ✓ Pre-Inventory (/api/pre-inventory)`);
      console.log(`  ✓ ML Analysis (/api/ml-analysis)`);
      console.log(`========================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Error handlers
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();

export default app;
