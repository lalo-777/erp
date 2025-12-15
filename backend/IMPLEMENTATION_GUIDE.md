# ERP Backend Implementation Guide

## 🎉 Current Status: MVP COMPLETE!

You now have a **working ERP backend API** with authentication and customer management.

### ✅ What's Been Created (35+ files)

#### Foundation (Stage 1 - COMPLETE)
- ✅ `package.json` - All dependencies configured
- ✅ `tsconfig.json` - TypeScript configuration
- ✅ `.env` & `.env.example` - Environment configuration
- ✅ `.gitignore` - Git ignore rules
- ✅ `README.md` - Project documentation

#### Configuration Files (COMPLETE)
- ✅ `src/config/environment.ts` - Environment loader
- ✅ `src/config/mysql.ts` - Database connection
- ✅ `src/config/multer.ts` - File upload configuration

#### Middleware (COMPLETE)
- ✅ `src/middleware/auth.ts` - JWT authentication & authorization
- ✅ `src/middleware/errorHandler.ts` - Centralized error handling

#### Utilities (COMPLETE)
- ✅ `src/utils/jwt.ts` - Token generation & verification
- ✅ `src/types/express.d.ts` - TypeScript type extensions

#### Database (Stage 2 - COMPLETE)
- ✅ `src/shared/erp_database_schema.sql` - Complete schema (28 catalogs + 32 entities)
- ✅ `src/shared/triggers/invoices_audit_trigger.sql`
- ✅ `src/shared/triggers/projects_audit_trigger.sql`
- ✅ `src/shared/triggers/contracts_audit_trigger.sql`
- ✅ `src/shared/triggers/work_orders_audit_trigger.sql`
- ✅ `src/shared/triggers/expense_reports_audit_trigger.sql`

#### Models (Stage 3 - PARTIAL)
**Core User Models:**
- ✅ `src/models/mysql/People.ts`
- ✅ `src/models/mysql/UserMySQL.ts` (with bcrypt password hashing)
- ✅ `src/models/mysql/LastAccess.ts`
- ✅ `src/models/mysql/HistoricalAccess.ts`

**Catalog Models (12/28 created):**
- ✅ Role, Gender, MaritalStatus, PersonTitle, Nationality, State
- ✅ InvoiceType, InvoiceStatus, PaymentMethod, PaymentStatus
- ✅ ExpenseCategory, ExpenseStatus

**Entity Models (1/32 created):**
- ✅ `src/models/mysql/Customer.ts`

#### Controllers (Stage 4 - PARTIAL)
- ✅ `src/controllers/auth.controller.ts` (login, logout, change password)
- ✅ `src/controllers/customers.controller.ts` (full CRUD with pagination)

#### Routes (Stage 5 - PARTIAL)
- ✅ `src/routes/auth.routes.ts`
- ✅ `src/routes/customers.routes.ts`

#### Server (Stage 7 - COMPLETE)
- ✅ `src/server.ts` - Express server with all middleware configured

#### Scripts (Stage 8 - PARTIAL)
- ✅ `src/scripts/createAdminUser.ts` - Creates initial admin user

---

## 🚀 Quick Start Guide

### 1. Install Dependencies

```bash
cd D:\erp\servidor\backend
npm install
```

### 2. Configure Environment

The `.env` file has been created. **Update your MySQL password:**

```bash
# Edit .env and set your MySQL password
MYSQL_PASSWORD=your_mysql_password_here
```

### 3. Create Database

Run the SQL schema script in MySQL:

```bash
# Option 1: Using MySQL command line
mysql -u root -p < src/shared/erp_database_schema.sql

# Option 2: Using MySQL Workbench
# - Open MySQL Workbench
# - Open src/shared/erp_database_schema.sql
# - Execute the script (⚡ icon or Ctrl+Shift+Enter)
```

This creates:
- Database `erp_development`
- 28 catalog tables with seed data
- 32 entity tables
- All relationships and indexes

### 4. Apply Database Triggers

Run each trigger file:

```bash
mysql -u root -p erp_development < src/shared/triggers/invoices_audit_trigger.sql
mysql -u root -p erp_development < src/shared/triggers/projects_audit_trigger.sql
mysql -u root -p erp_development < src/shared/triggers/contracts_audit_trigger.sql
mysql -u root -p erp_development < src/shared/triggers/work_orders_audit_trigger.sql
mysql -u root -p erp_development < src/shared/triggers/expense_reports_audit_trigger.sql
```

### 5. Create Admin User

```bash
npm run create-admin
```

This creates:
- Email: `admin@erp.com`
- Password: `admin123`
- Role: Administrator

### 6. Start Development Server

```bash
npm run dev
```

Server starts on `http://localhost:3001`

### 7. Test the API

**Health Check:**
```bash
curl http://localhost:3001/health
```

**Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@erp.com","password":"admin123"}'
```

**Get Customers (requires token):**
```bash
curl http://localhost:3001/api/customers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📋 What Still Needs to Be Created

### Remaining Catalog Models (16/28)

Create these files in `src/models/mysql/catalogs/`:

**Project Catalogs:**
- `ProjectStatus.ts`, `ProjectType.ts`, `ProjectArea.ts`
- `ContractType.ts`, `ContractStatus.ts`
- `WorkOrderType.ts`, `WorkOrderStatus.ts`

**Operations Catalogs:**
- `LaborType.ts`, `UnitOfMeasure.ts`, `MaterialCategory.ts`
- `WarehouseLocation.ts`, `TransactionType.ts`
- `SupplierCategory.ts`, `PurchaseOrderStatus.ts`, `FuelType.ts`

**ML Catalog:**
- `MLModel.ts`

### Remaining Entity Models (31/32)

Create these files in `src/models/mysql/`:

**Financial:**
- `Invoice.ts`, `InvoiceItem.ts`, `Payment.ts`
- `AccountsReceivable.ts`, `ExpenseReport.ts`, `ExpenseItem.ts`

**Projects:**
- `Project.ts`, `ProjectProgress.ts`, `ProjectProgressPhoto.ts`
- `WorkOrder.ts`, `Contract.ts`

**Operations:**
- `LaborTimesheet.ts`, `Material.ts`, `InventoryTransaction.ts`
- `PreInventory.ts`, `WarehouseReorganization.ts`
- `Supplier.ts`, `PurchaseOrder.ts`, `PurchaseOrderItem.ts`
- `FuelRequisition.ts`

**Support:**
- `File.ts`, `Note.ts`, `MLPrediction.ts`

**Model Index:**
- `src/models/mysql/index.ts` - Export all models

### Remaining Controllers (19/21)

Create these files in `src/controllers/`:

**Financial:**
- `invoices.controller.ts`, `payments.controller.ts`
- `accounts-receivable.controller.ts`, `expense-reports.controller.ts`

**Projects:**
- `projects.controller.ts`, `project-progress.controller.ts`
- `work-orders.controller.ts`, `contracts.controller.ts`

**Operations:**
- `labor.controller.ts`, `materials.controller.ts`, `inventory.controller.ts`
- `pre-inventory.controller.ts`, `warehouse-reorganization.controller.ts`
- `purchase-orders.controller.ts`, `fuel-requisitions.controller.ts`

**Support:**
- `catalog.controller.ts`, `files.controller.ts`, `notes.controller.ts`
- `ml-analysis.controller.ts`

### Remaining Routes (19/21)

Create matching route files in `src/routes/` for each controller above.

### Services & Validators (Stage 6)
- `src/services/ml-analysis.service.ts` - ML prediction placeholders
- 10 validator files in `src/validators/`

### Additional Scripts (Stage 8)
- `src/scripts/seedCatalogs.ts` - Populate catalog tables
- `src/scripts/seedTestData.ts` - Create test data

---

## 🎯 File Templates

### Template: Catalog Model

```typescript
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../config/mysql';

interface [Name]Attributes {
  id: number;
  name: string;
  alias: string;
  description?: string; // Optional field
}

export class [Name] extends Model<[Name]Attributes> implements [Name]Attributes {
  public id!: number;
  public name!: string;
  public alias!: string;
  public description?: string;
}

[Name].init({
  id: {
    type: DataTypes.TINYINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(64),
    allowNull: false,
  },
  alias: {
    type: DataTypes.STRING(16),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  sequelize,
  tableName: 'cat_[table_name]',
  timestamps: false,
});
```

### Template: Entity Model

```typescript
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/mysql';

interface [Entity]Attributes {
  id: number;
  // Add your fields here
  created_by: number;
  modified_by: number;
  created_date: Date;
  modified_date: Date;
  is_active: boolean;
}

interface [Entity]CreationAttributes
  extends Optional<[Entity]Attributes, 'id' | 'created_date' | 'modified_date' | 'is_active'> {}

export class [Entity] extends Model<[Entity]Attributes, [Entity]CreationAttributes>
  implements [Entity]Attributes {
  public id!: number;
  // Declare properties
  public created_by!: number;
  public modified_by!: number;
  public created_date!: Date;
  public modified_date!: Date;
  public is_active!: boolean;
}

[Entity].init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  // Define fields
  created_by: {
    type: DataTypes.SMALLINT.UNSIGNED,
    allowNull: false,
  },
  modified_by: {
    type: DataTypes.SMALLINT.UNSIGNED,
    allowNull: false,
  },
  created_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  modified_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  sequelize,
  tableName: '[table_name]',
  timestamps: false,
});
```

### Template: Controller

```typescript
import { Request, Response } from 'express';
import { sequelize } from '../config/mysql';
import { QueryTypes } from 'sequelize';
import { [Entity] } from '../models/mysql/[Entity]';

export const getAll[Entities] = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search as string || '';

    let whereClause = 'WHERE e.is_active = TRUE';
    const replacements: any = { limit, offset };

    if (search) {
      whereClause += ' AND e.name LIKE :search';
      replacements.search = `%${search}%`;
    }

    const query = `
      SELECT e.*
      FROM [table_name] e
      ${whereClause}
      ORDER BY e.created_date DESC
      LIMIT :limit OFFSET :offset
    `;

    const items = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    const countQuery = `SELECT COUNT(*) as total FROM [table_name] e ${whereClause}`;
    const [{ total }] = await sequelize.query(countQuery, {
      replacements: { search: replacements.search },
      type: QueryTypes.SELECT,
    }) as any;

    res.status(200).json({
      success: true,
      data: items,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve items',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const get[Entity]ById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const item = await [Entity].findByPk(id);

    if (!item) {
      res.status(404).json({
        success: false,
        message: 'Item not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve item',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const create[Entity] = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;

    const item = await [Entity].create({
      ...req.body,
      created_by: userId,
      modified_by: userId,
    });

    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create item',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const update[Entity] = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    // Set session variables for audit trigger
    await sequelize.query('SET @user_id = :userId', {
      replacements: { userId },
    });
    await sequelize.query('SET @change_date = NOW()');

    const item = await [Entity].findByPk(id);

    if (!item) {
      res.status(404).json({
        success: false,
        message: 'Item not found',
      });
      return;
    }

    await item.update({
      ...req.body,
      modified_by: userId,
    });

    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update item',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const delete[Entity] = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const item = await [Entity].findByPk(id);

    if (!item) {
      res.status(404).json({
        success: false,
        message: 'Item not found',
      });
      return;
    }

    await item.update({ is_active: false });

    res.status(200).json({
      success: true,
      message: 'Item deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete item',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
```

### Template: Route

```typescript
import { Router } from 'express';
import {
  getAll[Entities],
  get[Entity]ById,
  create[Entity],
  update[Entity],
  delete[Entity],
} from '../controllers/[entity].controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getAll[Entities]);
router.get('/:id', get[Entity]ById);
router.post('/', create[Entity]);
router.put('/:id', update[Entity]);
router.delete('/:id', delete[Entity]);

export default router;
```

---

## 📊 Progress Summary

| Stage | Status | Files Created | Files Remaining |
|-------|--------|---------------|-----------------|
| 1. Foundation | ✅ Complete | 11/11 | 0 |
| 2. Database | ✅ Complete | 6/6 | 0 |
| 3. Models | 🔄 Partial | 17/61 | 44 |
| 4. Controllers | 🔄 Partial | 2/21 | 19 |
| 5. Routes | 🔄 Partial | 2/21 | 19 |
| 6. Services/Validators | ⏳ Pending | 0/11 | 11 |
| 7. Server | ✅ Complete | 1/1 | 0 |
| 8. Scripts | 🔄 Partial | 1/3 | 2 |
| **TOTAL** | **23%** | **40/135** | **95** |

---

## 🎯 Next Steps

### Option 1: Complete Implementation Yourself
Use the templates above to create the remaining files. The patterns are consistent:
1. Create catalog models (copy & modify template)
2. Create entity models (copy & modify template)
3. Create controllers (copy customers.controller.ts pattern)
4. Create routes (copy customers.routes.ts pattern)
5. Add routes to server.ts

### Option 2: Continue with Claude Code
Ask Claude Code to continue implementing specific modules:
- "Create all Project module files (models, controllers, routes)"
- "Create all Operations module files"
- "Create the ML analysis service"

### Option 3: Hybrid Approach
1. Test the current MVP
2. Identify which modules you need first
3. Ask Claude Code to implement priority modules
4. Complete remaining modules yourself using templates

---

## 🧪 Testing Your Implementation

### 1. Test Database Connection
```bash
mysql -u root -p -e "USE erp_development; SHOW TABLES;"
```

You should see 60 tables.

### 2. Test Server Startup
```bash
npm run dev
```

Should show no errors and list available endpoints.

### 3. Test Authentication
```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@erp.com","password":"admin123"}'

# Save the token from response
export TOKEN="your_token_here"

# Test authenticated endpoint
curl http://localhost:3001/api/customers \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Test Customer CRUD
```bash
# Create customer
curl -X POST http://localhost:3001/api/customers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"company_name":"Test Company","rfc":"TEST123456ABC"}'

# Get all customers
curl http://localhost:3001/api/customers \
  -H "Authorization: Bearer $TOKEN"

# Get customer by ID
curl http://localhost:3001/api/customers/1 \
  -H "Authorization: Bearer $TOKEN"

# Update customer
curl -X PUT http://localhost:3001/api/customers/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"company_name":"Updated Company"}'

# Delete customer (soft delete)
curl -X DELETE http://localhost:3001/api/customers/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📚 Additional Resources

### Database Schema Reference
See `src/shared/erp_database_schema.sql` for complete schema with comments.

### CRM Reference Implementation
Reference the CRM project at `D:\crm\backend` for additional patterns and examples.

### Architecture Patterns Used
- **Layered MVC**: Routes → Controllers → Models → Database
- **JWT Authentication**: Token-based auth with role-based access
- **Audit Logging**: Database triggers track all changes
- **Soft Deletes**: is_active flag instead of hard deletes
- **Pagination**: Standard page/limit/offset pattern
- **Error Handling**: Centralized middleware

---

## 🎉 Congratulations!

You have a working ERP backend with:
- ✅ Authentication system
- ✅ Customer management
- ✅ Database with full schema
- ✅ Audit triggers
- ✅ JWT security
- ✅ TypeScript type safety
- ✅ Error handling
- ✅ CORS protection

Happy coding! 🚀
