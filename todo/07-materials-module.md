# Materials Module

## Phase Status: Not Started (0/6)

## Backend Status
✅ COMPLETE - All endpoints implemented
- `D:\erp\servidor\backend\src\controllers\materials.controller.ts`
- `D:\erp\servidor\backend\src\routes\materials.routes.ts`

## Tasks

### 1. Verify Backend Integration
- [ ] Ensure server.ts includes material routes
- [ ] Test endpoints including `/low-stock`
- [ ] Verify auto-generation of material codes (MAT-000001)

### 2. Material Service
**File:** `D:\erp\servidor\erp\src\app\services\material.service.ts`

- [ ] Implement CRUD methods
- [ ] Implement `getMaterialStats()`
- [ ] Implement `getLowStockMaterials()`
- [ ] Implement `getInventoryTransactions(materialId)` (future)
- [ ] Implement `adjustStock(materialId, quantity, type)` (future)

### 3. Material Models
**File:** `D:\erp\servidor\erp\src\app\models\material.model.ts`

- [ ] Define `Material` interface
- [ ] Define `MaterialListItem` interface
- [ ] Define `CreateMaterialRequest` interface
- [ ] Define `MaterialStats` interface
- [ ] Define `InventoryTransaction` interface (future)

### 4. Materials Dashboard
**File:** `D:\erp\servidor\erp\src\app\pages\materials\dashboard\materials-dashboard.component.ts`

- [ ] Create component structure
- [ ] Load materials with pagination
- [ ] Load stats (total items, total value, low stock count)
- [ ] Implement filters (category, location, stock level)
- [ ] Implement search
- [ ] Add "Nuevo Material" button
- [ ] Highlight low stock items (red badge)

**HTML:**
- [ ] Add stats cards (Total Items, Total Value, Low Stock Alerts)
- [ ] Use DataTable with columns: Code, Name, Category, Unit, Current Stock, Min Stock, Unit Cost, Total Value, Location, Status
- [ ] Add stock level indicators (green=ok, yellow=low, red=critical)
- [ ] Add low stock warning banner

### 5. New Material Modal
**File:** `D:\erp\servidor\erp\src\app\components\new-material-modal\new-material-modal.component.ts`

- [ ] Create reactive form
- [ ] Add material code (auto-generated, display only)
- [ ] Add name input (required)
- [ ] Add description textarea
- [ ] Add category dropdown (catalog: cat_material_categories)
- [ ] Add unit of measure dropdown (catalog: cat_units_of_measure)
- [ ] Add unit cost input
- [ ] Add current stock input (default 0)
- [ ] Add minimum stock input
- [ ] Add maximum stock input
- [ ] Add warehouse location dropdown (catalog)
- [ ] Implement validation
- [ ] Implement submit

### 6. Material Tracking Page
**File:** `D:\erp\servidor\erp\src\app\pages\materials\tracking\material-tracking.component.ts`

**Sections:**
- [ ] Material header (code, name, current stock with visual indicator)
- [ ] Material details card
- [ ] Stock level gauge/chart
- [ ] Transaction history table (future)
- [ ] Usage by project table (future)
- [ ] Supplier information (future)
- [ ] Reorder suggestions (if stock < min)
- [ ] Notes section
- [ ] Files section

**Actions:**
- [ ] Edit material button
- [ ] Delete material button
- [ ] Adjust stock button (future)
- [ ] Reorder button (future)

## Business Logic

**Material Code:** Auto-generated (MAT-000001, MAT-000002, etc.)

**Stock Level Logic:**
```
if current_stock <= 0:
  status = "Agotado" (red/danger)
elif current_stock < minimum_stock:
  status = "Stock Bajo" (yellow/warning)
elif current_stock <= minimum_stock * 1.2:
  status = "Próximo a mínimo" (yellow/warning)
else:
  status = "Stock Adecuado" (green/success)
```

**Total Value:**
```
total_value = current_stock * unit_cost
```

**Reorder Quantity:**
```
reorder_qty = maximum_stock - current_stock
```

## Stock Indicators

Use visual indicators in the dashboard:
- **Green circle:** Stock > min_stock * 1.2
- **Yellow circle:** Stock between min_stock and min_stock * 1.2
- **Red circle:** Stock < min_stock
- **Black circle:** Stock = 0 (agotado)

## Notes

- Low stock alerts should be prominent
- Consider adding email notifications for low stock (future)
- Transaction history tracks all stock movements (future module)
- Integration with purchase orders (future)
- Bar code scanning (future enhancement)
