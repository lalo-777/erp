# Operations Modules

## Phase Status: In Progress (5/15) - Labor Module Complete

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

## 2. Warehouse/Almacén Module (0/3)

### Backend
- [ ] Extend materials controller with warehouse operations
- [ ] Add warehouse reports endpoints
- [ ] Create warehouse transactions endpoints

### Frontend
- [ ] Create warehouse dashboard
- [ ] Create stock by location view
- [ ] Create transfer materials modal
- [ ] Create inventory adjustment modal
- [ ] Create stock reports page

**Features:**
- View stock by warehouse location
- Transfer materials between locations
- Adjust inventory (corrections)
- Generate stock reports
- Track movements

---

## 3. Pre-Inventory Module (0/3)

### Backend
- [ ] Create `PreInventory` model
- [ ] Create `pre-inventory.controller.ts`
- [ ] Create `pre-inventory.routes.ts`

### Frontend
- [ ] Create pre-inventory dashboard
- [ ] Create physical count interface
- [ ] Create discrepancy reports
- [ ] Create adjustment processing

**Features:**
- Physical inventory count preparation
- Record expected vs actual counts
- Identify discrepancies
- Process adjustments
- Generate variance reports

---

## 4. Purchase Orders/Pedidos Module (0/3)

### Backend
- [ ] Create `purchase-orders.controller.ts`
- [ ] Implement PO CRUD
- [ ] Implement approval workflow
- [ ] Create PO routes

### Frontend
- [ ] Create PO dashboard
- [ ] Create new PO modal with items
- [ ] Create supplier autocomplete
- [ ] Create PO tracking with status workflow
- [ ] Create receiving interface
- [ ] Implement approval buttons

**Features:**
- Create purchase orders to suppliers
- Add multiple items per PO
- Track PO status (draft, pending, approved, received, cancelled)
- Approval workflow
- Receiving functionality
- Update material stock on receive

**PO Status Flow:**
```
Draft → Pending Approval → Approved → Partially Received → Received
                ↓
            Cancelled
```

---

## 5. Fuel Requisitions Module (0/1)

### Backend
- [ ] Create `FuelRequisition` model
- [ ] Create `fuel-requisitions.controller.ts`
- [ ] Create fuel-requisitions.routes.ts`

### Frontend
- [ ] Create fuel requisitions dashboard
- [ ] Create new requisition modal
- [ ] Create vehicle/equipment selection
- [ ] Create approval workflow UI
- [ ] Create tracking page

**Features:**
- Request fuel for vehicles/equipment
- Track fuel consumption
- Approval workflow
- Associate with projects
- Generate consumption reports

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
