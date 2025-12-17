# Operations Modules

## Phase Status: Complete (15/15) - All Operations Modules Complete

These modules handle day-to-day operations: labor tracking, warehouse management, purchase orders, and fuel requisitions.

## Modules Overview

1. Labor/Mano de Obra
2. Warehouse/Almacén
3. Pre-Inventory
4. Purchase Orders/Pedidos
5. Fuel Requisitions

---

## 1. Labor/Mano de Obra Module (5/5) ✅ COMPLETE

### Backend
- [x] Create `LaborTimesheet` model
- [x] Create `labor.controller.ts` (CRUD + reports)
- [x] Create `labor.routes.ts`
- [x] Add routes to server.ts

### Frontend
- [x] Create labor service
- [x] Create labor dashboard (timesheet table)
- [x] Create new timesheet modal
- [x] Create labor tracking page
- [x] Implement worker selection
- [x] Implement project assignment
- [x] Implement hours and performance tracking
- [x] Implement payment calculations

### Implementation Details
**Files Created:**
- Backend: `backend/src/models/mysql/LaborTimesheet.ts`, `backend/src/controllers/labor.controller.ts`, `backend/src/routes/labor.routes.ts`, `backend/sql/labor_timesheets.sql`
- Frontend: `erp/src/app/models/labor.model.ts`, `erp/src/app/services/labor.service.ts`, `erp/src/app/pages/labor/dashboard/`, `erp/src/app/pages/labor/tracking/`, `erp/src/app/components/new-labor-timesheet-modal/`

**Payment Status Workflow:**
```
Pending → Approved → Paid
```

**Features Implemented:**
- Auto-generated timesheet codes (TS-000001, TS-000002, etc.)
- Worker and project assignment
- Hours tracking with validation (0.01 to 24 hours)
- Hourly rate and automatic payment calculation
- Performance scoring (0-10 scale)
- Payment approval workflow
- Statistics dashboard (workers, hours, payroll, pending payments)
- Payroll reports with date ranges
- Integration with projects module

**Date Completed:** 2025-12-16

**Features:**
- Record daily timesheets per worker
- Assign workers to projects
- Track hours worked
- Track performance/rendimiento
- Calculate payments
- Generate payroll reports

---

## 2. Warehouse/Almacén Module (6/6) ✅ COMPLETE

### Backend
- [x] Create `WarehouseLocation` model
- [x] Create `InventoryTransaction` model
- [x] Create `WarehouseReorganization` model
- [x] Create `warehouse.controller.ts` (all operations + reports)
- [x] Create `warehouse.routes.ts`
- [x] Add routes to server.ts

### Frontend
- [x] Create warehouse service
- [x] Create warehouse models and interfaces
- [x] Create warehouse dashboard (stats, locations, transactions)
- [x] Create stock by location view
- [x] Create transfer materials modal
- [x] Create inventory adjustment modal
- [x] Implement transaction history
- [x] Implement transfer history
- [x] Implement stock reports

### Implementation Details
**Files Created:**
- Backend: `backend/src/models/mysql/WarehouseLocation.ts`, `backend/src/models/mysql/InventoryTransaction.ts`, `backend/src/models/mysql/WarehouseReorganization.ts`, `backend/src/controllers/warehouse.controller.ts`, `backend/src/routes/warehouse.routes.ts`
- Frontend: `erp/src/app/models/warehouse.model.ts`, `erp/src/app/services/warehouse.service.ts`, `erp/src/app/pages/warehouse/dashboard/`, `erp/src/app/pages/warehouse/stock/`, `erp/src/app/components/transfer-material-modal/`, `erp/src/app/components/adjust-inventory-modal/`

**Transaction Types:**
```
Entry → Entrada (aumenta stock)
Exit → Salida (disminuye stock)
Transfer → Transferencia (entre ubicaciones)
Adjustment → Ajuste (correcciones)
```

**Features Implemented:**
- Auto-generated transaction numbers (TRX-000001, TRX-000002, etc.)
- View stock by warehouse location with search
- Transfer materials between locations with validation
- Adjust inventory (entry, exit, adjustment)
- Transaction history with filters (material, location, type, date range)
- Transfer history with pagination
- Warehouse statistics dashboard (locations, materials, transactions, values)
- Stock reports with filters (location, category, low stock)
- Real-time stock calculations by location
- Integration with materials module
- Stock status indicators (adequate, low, critical, out of stock)

**Date Completed:** 2025-12-16

**Features:**
- View stock by warehouse location
- Transfer materials between locations
- Adjust inventory (corrections)
- Generate stock reports
- Track movements
- Monitor stock levels per location
- Generate transaction reports

---

## 3. Pre-Inventory Module (3/3) ✅ COMPLETE

### Backend
- [x] Create `PreInventory` model
- [x] Create `PreInventoryStatus` catalog model
- [x] Create `pre-inventory.controller.ts` (CRUD + reports)
- [x] Create `pre-inventory.routes.ts`
- [x] Add routes to server.ts

### Frontend
- [x] Create pre-inventory models and service
- [x] Create pre-inventory dashboard with statistics
- [x] Create physical count interface (detail view)
- [x] Create discrepancy reports
- [x] Create adjustment processing

### Implementation Details
**Files Created:**
- Backend: `backend/src/models/mysql/PreInventory.ts`, `backend/src/models/mysql/catalogs/PreInventoryStatus.ts`, `backend/src/controllers/pre-inventory.controller.ts`, `backend/src/routes/pre-inventory.routes.ts`, `backend/sql/pre_inventory.sql`
- Frontend: `erp/src/app/models/pre-inventory.model.ts`, `erp/src/app/services/pre-inventory.service.ts`, `erp/src/app/pages/pre-inventory/dashboard/`, `erp/src/app/pages/pre-inventory/detail/`, `erp/src/app/pages/pre-inventory/discrepancy-report/`

**Status Workflow:**
```
Pending → Counted → Adjusted
         ↓
      Cancelled
```

**Features Implemented:**
- Auto-generated pre-inventory numbers (PINV-000001, PINV-000002, etc.)
- Create pre-inventory records with expected quantity from system
- Update physical count with actual counted quantity
- Automatic discrepancy calculation (quantity and value)
- Process adjustments to create inventory transactions
- Discrepancy reports with filters (location, date range, only discrepancies)
- Statistics dashboard (total counts, pending, completed, adjusted, discrepancies)
- Visual indicators for overages and shortages
- Integration with warehouse and materials modules
- Prevent adjustments on already processed records

**Date Completed:** 2025-12-16

**Features:**
- Physical inventory count preparation
- Record expected vs actual counts
- Identify discrepancies (quantity and value)
- Process adjustments to inventory
- Generate variance reports
- Track overages and shortages
- Financial impact analysis

---

## 4. Purchase Orders/Pedidos Module (3/3) ✅ COMPLETE

### Backend
- [x] Create `PurchaseOrder` model
- [x] Create `PurchaseOrderItem` model
- [x] Create `purchase-orders.controller.ts` (CRUD + approval workflow)
- [x] Create `purchase-orders.routes.ts`
- [x] Add routes to server.ts

### Frontend
- [x] Create purchase-order models and service
- [x] Create purchase orders dashboard with statistics
- [x] Create purchase order detail/tracking page
- [x] Implement approval workflow buttons
- [x] Implement receiving interface with quantity inputs
- [x] Integrate routes in app.routes.ts and navigation

### Implementation Details
**Files Created:**
- Backend: `backend/src/models/mysql/PurchaseOrder.ts`, `backend/src/models/mysql/PurchaseOrderItem.ts`, `backend/src/models/mysql/Supplier.ts`, `backend/src/controllers/purchase-orders.controller.ts`, `backend/src/routes/purchase-orders.routes.ts`, `backend/sql/purchase_orders.sql` (ALTER TABLE para agregar campos faltantes)
- Frontend: `erp/src/app/models/purchase-order.model.ts`, `erp/src/app/services/purchase-order.service.ts`, `erp/src/app/pages/purchase-orders/dashboard/`, `erp/src/app/pages/purchase-orders/detail/`

**IMPORTANTE:** Se ajustó para usar la estructura de base de datos existente:
- Usa tabla `purchase_orders` existente (con campos `po_number`, `supplier_id`, `po_status_id`)
- Usa tabla `purchase_order_items` existente (con campo `amount` en lugar de `subtotal`)
- Usa tabla `suppliers` existente
- SQL script solo agrega campos: `is_active`, `received_quantity`, `created_date`
- Ver `backend/sql/PURCHASE_ORDERS_MIGRATION_NOTES.md` para detalles

**Status Workflow:**
```
Draft → Pending Approval → Approved → Partially Received → Received
                ↓
            Cancelled
```

**Features Implemented:**
- Auto-generated purchase order numbers (PO-000001, PO-000002, etc.)
- Create purchase orders with supplier information
- Add multiple material items per order
- Track quantities ordered vs received
- Approval workflow (draft → pending → approved)
- Receiving interface with quantity validation
- Automatic stock updates on material receipt
- Partial receiving support
- Status tracking (draft, pending, approved, partially received, received, cancelled)
- Statistics dashboard (total orders, pending, approved, amounts)
- Integration with materials module
- Progress indicators for received items

**Date Completed:** 2025-12-16

**Features:**
- Create purchase orders to suppliers
- Add multiple items per PO
- Track PO status (draft, pending, approved, partially received, received, cancelled)
- Approval workflow
- Receiving functionality with partial support
- Automatic material stock updates on receive
- Order statistics and reporting

---

## 5. Fuel Requisitions Module (1/1) ✅ COMPLETE

### Backend
- [x] Create `FuelRequisition` model
- [x] Create `fuel-requisitions.controller.ts` (CRUD + reports + workflow)
- [x] Create `fuel-requisitions.routes.ts`
- [x] Add routes to server.ts

### Frontend
- [x] Create fuel requisitions service
- [x] Create fuel requisitions models and interfaces
- [x] Create fuel requisitions dashboard (stats, list, filters)
- [x] Create fuel requisition detail/tracking page
- [x] Create new fuel requisition modal
- [x] Implement vehicle/equipment selection
- [x] Implement fuel type and quantity tracking
- [x] Implement automatic total calculation
- [x] Implement approval workflow UI
- [x] Integrate routes in app.routes.ts and navigation

### Implementation Details
**Files Created:**
- Backend: `backend/src/models/mysql/FuelRequisition.ts`, `backend/src/controllers/fuel-requisitions.controller.ts`, `backend/src/routes/fuel-requisitions.routes.ts`, `backend/sql/fuel_requisitions.sql`
- Frontend: `erp/src/app/models/fuel-requisition.model.ts`, `erp/src/app/services/fuel-requisition.service.ts`, `erp/src/app/pages/fuel-requisitions/dashboard/`, `erp/src/app/pages/fuel-requisitions/detail/`, `erp/src/app/components/new-fuel-requisition-modal/`

**Status Workflow:**
```
Pending → Approved → Delivered
         ↓
      Cancelled
```

**Features Implemented:**
- Auto-generated requisition codes (FR-000001, FR-000002, etc.)
- Vehicle and equipment tracking
- Project assignment (optional)
- Fuel type selection (gasoline, diesel, other)
- Quantity and unit price tracking
- Automatic total amount calculation
- Odometer reading tracking (optional)
- Approval workflow (pending → approved → delivered)
- Statistics dashboard (total vehicles, liters, cost, pending amounts)
- Fuel type distribution report
- Consumption reports with date ranges and filters
- Integration with projects module
- Status tracking with approval/delivery dates

**Date Completed:** 2025-12-16

**Features:**
- Request fuel for vehicles/equipment
- Track fuel consumption by vehicle and fuel type
- Approval workflow with status tracking
- Associate with projects for cost tracking
- Generate consumption reports
- Monitor fuel costs and usage patterns
- Odometer readings for mileage tracking

---

## Integration Points

### Labor → Projects
- Assign workers to projects
- Track labor costs per project
- Update project actual costs

### Warehouse → Materials
- Material stock movements
- Location tracking
- Inventory adjustments

### Purchase Orders → Materials
- Create PO from low stock materials
- Receive PO updates material stock
- Track supplier performance

### Fuel → Projects
- Assign fuel usage to projects
- Track fuel costs per project

---

## Notes

- These modules are lower priority than core modules
- Implement after Customers, Invoices, Projects, Materials are complete
- Some features can be simplified in MVP
- Consider approval workflows for POs and Fuel
- Integration with accounting/expenses (future)
