# Projects Module

## Phase Status: Not Started (0/7)

## Backend Status
✅ COMPLETE - All endpoints implemented
- `D:\erp\servidor\backend\src\controllers\projects.controller.ts`
- `D:\erp\servidor\backend\src\routes\projects.routes.ts`

## Tasks

### 1. Verify Backend Integration
- [ ] Ensure server.ts includes project routes
- [ ] Test endpoints
- [ ] Verify auto-generation of project codes (PRJ-000001)

### 2. Project Service
**File:** `D:\erp\servidor\erp\src\app\services\project.service.ts`

- [ ] Implement CRUD methods
- [ ] Implement `getProjectStats()`
- [ ] Implement `getProjectHistory(id)`
- [ ] Implement `getProjectsByCustomer(customerId)`
- [ ] Implement `getProjectProgress(projectId)`
- [ ] Implement `uploadProgressPhoto(projectId, file)` (future)

### 3. Project Models
**File:** `D:\erp\servidor\erp\src\app\models\project.model.ts`

- [ ] Define `Project` interface
- [ ] Define `ProjectListItem` interface
- [ ] Define `CreateProjectRequest` interface
- [ ] Define `ProjectStats` interface
- [ ] Define `ProjectProgress` interface

### 4. Projects Dashboard
**File:** `D:\erp\servidor\erp\src\app\pages\projects\dashboard\projects-dashboard.component.ts`

- [ ] Create component structure
- [ ] Load projects with pagination
- [ ] Load stats (total, active, completed, on_hold, budget summary)
- [ ] Implement filters (status, type, area, manager, customer)
- [ ] Implement search
- [ ] Add "Nuevo Proyecto" button
- [ ] Display progress bar per project

**HTML:**
- [ ] Add stats cards (4 cards: total, active, completed, budget utilization)
- [ ] Use DataTable with columns: Code, Name, Customer, Type, Manager, Budget, Actual Cost, Progress %, Status
- [ ] Add status badges
- [ ] Add progress bars inline

### 5. New Project Modal
**File:** `D:\erp\servidor\erp\src\app\components\new-project-modal\new-project-modal.component.ts`

- [ ] Create reactive form
- [ ] Add customer autocomplete
- [ ] Add project name input
- [ ] Add project type dropdown (catalog)
- [ ] Add project area dropdown (catalog)
- [ ] Add description textarea
- [ ] Add start date picker
- [ ] Add estimated end date picker
- [ ] Add budget amount input
- [ ] Add manager dropdown (users list)
- [ ] Implement validation
- [ ] Implement submit
- [ ] Show success toast

### 6. Project Tracking Page
**File:** `D:\erp\servidor\erp\src\app\pages\projects\tracking\project-tracking.component.ts`

**Sections:**
- [ ] Project header (code, name, status, dates)
- [ ] Customer info card
- [ ] Financial summary (budget vs actual)
- [ ] Progress timeline (future: with photos)
- [ ] Work orders table (future)
- [ ] Contract details (future)
- [ ] Materials usage table (future)
- [ ] Labor assignments table (future)
- [ ] Notes section
- [ ] Files section
- [ ] Audit history section

**Actions:**
- [ ] Edit project button
- [ ] Delete project button
- [ ] Update progress button
- [ ] Generate report button (future)

### 7. Integration Testing
- [ ] Test create project
- [ ] Test edit project
- [ ] Test delete project
- [ ] Test filters and search
- [ ] Test pagination
- [ ] Test tracking page display
- [ ] Test audit history
- [ ] Test navigation

## Business Logic

**Project Code:** Auto-generated (PRJ-000001, PRJ-000002, etc.)

**Status Values:**
- active (verde/success)
- completed (azul/info)
- on_hold (amarillo/warning)
- cancelled (gris/secondary)

**Progress Calculation:**
```
progress_percent = (actual_progress / 100) * 100
budget_utilization = (actual_cost / budget_amount) * 100
```

**Financial Indicators:**
- Under budget: actual_cost < budget_amount (green)
- On budget: actual_cost ≈ budget_amount (yellow)
- Over budget: actual_cost > budget_amount (red)

## Notes

- Project has many relationships: customer, work orders, contracts, materials, labor
- Start with basic CRUD, expand with related modules later
- Progress photos stored in files table with section_id = projects
- Manager comes from users table (active users only)
