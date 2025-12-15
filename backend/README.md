# ERP Backend API

ERP Backend system built with Express.js + TypeScript + Sequelize + MySQL.

## Features

- 15 business modules (Financial, Projects, Operations)
- JWT authentication with role-based access control
- Full audit system with database triggers
- File upload support for documents and photos
- Machine Learning prediction endpoints
- RESTful API design with consistent response format

## Technology Stack

- **Framework:** Express.js 4.21.1
- **Language:** TypeScript 5.6.3
- **Database:** MySQL 8.0
- **ORM:** Sequelize 6.37.7
- **Authentication:** JWT with bcrypt
- **Validation:** express-validator 7.2.0

## Setup

### Prerequisites

- Node.js (v18 or higher)
- MySQL 8.0
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Create the database:
   ```bash
   # Run the SQL schema script in MySQL
   mysql -u root -p < src/shared/erp_database_schema.sql
   ```

5. Create admin user:
   ```bash
   npm run create-admin
   ```

6. Seed catalog tables:
   ```bash
   npm run seed-catalogs
   ```

## Development

Start the development server:
```bash
npm run dev
```

The server will run on `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/change-password` - Change password

### Financial Modules
- `/api/invoices` - Invoice management
- `/api/payments` - Payment tracking
- `/api/accounts-receivable` - Collections management
- `/api/expense-reports` - Expense verification

### Project Modules
- `/api/projects` - Project management
- `/api/project-progress` - Progress tracking with photos
- `/api/work-orders` - Work order management
- `/api/contracts` - Contract management

### Operations Modules
- `/api/labor` - Labor timesheet tracking
- `/api/materials` - Material master data
- `/api/inventory` - Inventory transactions
- `/api/purchase-orders` - Purchase order management
- `/api/fuel-requisitions` - Fuel requisition management

### Support
- `/api/catalogs` - Catalog data
- `/api/customers` - Customer management
- `/api/files` - File upload/download
- `/api/notes` - Notes management

### Machine Learning
- `/api/ml-analysis` - ML prediction endpoints

## Project Structure

```
backend/
├── src/
│   ├── config/              # Configuration files
│   ├── controllers/         # Business logic (21 files)
│   ├── routes/              # API routes (21 files)
│   ├── models/
│   │   └── mysql/
│   │       └── catalogs/    # Catalog models (28 files)
│   ├── middleware/          # Auth, error handling
│   ├── validators/          # Input validation
│   ├── services/            # Business services
│   ├── utils/               # Utilities
│   ├── shared/              # SQL scripts, triggers
│   ├── scripts/             # Utility scripts
│   └── server.ts            # Entry point
└── uploads/                 # File storage
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run create-admin` - Create admin user
- `npm run seed-catalogs` - Seed catalog tables
- `npm test` - Run tests

## License

ISC
