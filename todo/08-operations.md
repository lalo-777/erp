# Operations Modules

## Phase Status: Not Started (0/15)

These modules handle day-to-day operations: labor tracking, warehouse management, purchase orders, and fuel requisitions.

## Modules Overview

1. Labor/Mano de Obra
2. Warehouse/Almacén
3. Pre-Inventory
4. Purchase Orders/Pedidos
5. Fuel Requisitions

---

## 1. Labor/Mano de Obra Module (0/5)

### Backend
- [ ] Create `LaborTimesheet` model
- [ ] Create `labor.controller.ts` (CRUD + reports)
- [ ] Create `labor.routes.ts`
- [ ] Add routes to server.ts

### Frontend
- [ ] Create labor service
- [ ] Create labor dashboard (timesheet table)
- [ ] Create new timesheet modal
- [ ] Create labor tracking page
- [ ] Implement worker selection
- [ ] Implement project assignment
- [ ] Implement hours and performance tracking
- [ ] Implement payment calculations

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
