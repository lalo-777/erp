# Admin Module

## Phase Status: Not Started (0/5)

Admin panel for system configuration, user management, and catalog management.

## Tasks

### 1. Users Management (0/2)

#### Backend
- [ ] Extend auth controller with user CRUD
- [ ] Create `users.controller.ts`
- [ ] Create `users.routes.ts`
- [ ] Add routes to server.ts

#### Frontend
- [ ] Create users dashboard
  - [ ] List all users in table
  - [ ] Show user status (active/inactive)
  - [ ] Show role badges
  - [ ] Add search functionality
- [ ] Create new user modal
  - [ ] Person information (first name, last name, etc.)
  - [ ] Email (required, unique)
  - [ ] Password (required, min 6 chars)
  - [ ] Role selection (from cat_roles)
  - [ ] Account expiration date (optional)
  - [ ] Active status checkbox
- [ ] Create edit user modal
  - [ ] Same fields as new user
  - [ ] Password field optional (only if changing)
- [ ] Implement activate/deactivate user
- [ ] Implement reset password functionality

**Features:**
- CRUD operations on users
- Assign roles (admin, manager, user, etc.)
- Activate/deactivate accounts
- Set account expiration dates
- Reset passwords
- View last access and login history

---

### 2. Catalogs Management (0/2)

#### Backend
✅ COMPLETE - Generic catalog controller already exists!
- `D:\erp\servidor\backend\src\controllers\catalog.controller.ts`
- `D:\erp\servidor\backend\src\routes\catalog.routes.ts`

Handles all 28 catalogs dynamically:
- GET `/api/catalogs` - List all available catalogs
- GET `/api/catalogs/:catalogName` - Get all entries
- GET `/api/catalogs/:catalogName/:id` - Get specific entry
- POST `/api/catalogs/:catalogName` - Create entry
- PUT `/api/catalogs/:catalogName/:id` - Update entry
- DELETE `/api/catalogs/:catalogName/:id` - Delete entry

#### Frontend
- [ ] Create catalogs dashboard
  - [ ] Display list of all available catalogs (28 catalogs)
  - [ ] Show catalog name and entry count
  - [ ] Click to open catalog detail
- [ ] Create catalog detail page
  - [ ] Show catalog entries in table
  - [ ] Columns: ID, Name, Alias, Description
  - [ ] Add "New Entry" button
  - [ ] Add edit/delete actions per row
- [ ] Create catalog entry modal
  - [ ] Name input (required)
  - [ ] Alias input (required, unique)
  - [ ] Description input (optional)
  - [ ] Support both create and edit modes
- [ ] Create catalog service
  - [ ] Get all catalogs list
  - [ ] Get entries for specific catalog
  - [ ] CRUD operations for entries

**Catalogs to Manage (28):**
1. roles
2. genders
3. marital-statuses
4. person-titles
5. nationalities
6. states
7. invoice-types
8. invoice-statuses
9. payment-methods
10. payment-statuses
11. expense-categories
12. expense-statuses
13. project-statuses
14. project-types
15. project-areas
16. contract-types
17. contract-statuses
18. work-order-types
19. work-order-statuses
20. labor-types
21. units-of-measure
22. material-categories
23. warehouse-locations
24. transaction-types
25. supplier-categories
26. purchase-order-statuses
27. fuel-types
28. ml-models

---

### 3. System Configuration (0/1)

- [ ] Create settings page
  - [ ] Company information
    - [ ] Company name
    - [ ] RFC
    - [ ] Address
    - [ ] Phone
    - [ ] Email
    - [ ] Logo upload
  - [ ] System preferences
    - [ ] Default tax rate
    - [ ] Default currency
    - [ ] Date format
    - [ ] Timezone
  - [ ] Email settings (future)
    - [ ] SMTP configuration
    - [ ] Email templates
  - [ ] Backup settings (future)
    - [ ] Auto-backup schedule
    - [ ] Backup location

---

### 4. Audit Logs Viewer (Optional)

- [ ] Create audit logs dashboard
  - [ ] Show all audit logs from various tables
  - [ ] Filter by table (invoices, projects, contracts, etc.)
  - [ ] Filter by user
  - [ ] Filter by date range
  - [ ] Show old value vs new value
  - [ ] Show change date and user

**Tables with Audit:**
- invoices_log
- projects_log
- contracts_log
- work_orders_log
- expense_reports_log

---

### 5. Reports & Analytics (Future)

- [ ] Create reports dashboard
- [ ] Financial reports
- [ ] Project reports
- [ ] Inventory reports
- [ ] Labor reports
- [ ] Export to Excel/PDF

---

## Admin Dashboard Layout

```
Admin Panel
├── Users Management
│   └── List, Create, Edit, Activate/Deactivate
├── Catalogs Management
│   └── Manage all 28 system catalogs
├── System Settings
│   └── Company info, Preferences
├── Audit Logs (optional)
│   └── View all system changes
└── Reports (future)
    └── Various business reports
```

---

## Security Considerations

- [ ] Only users with role "admin" can access admin panel
- [ ] Use `authorize(['admin'])` middleware on all admin routes
- [ ] Audit all admin actions
- [ ] Require password confirmation for sensitive operations
- [ ] Log all user management actions

---

## Notes

- Catalog management is the most important admin feature
- Backend catalog controller is already complete and working
- Use DataTable component for all list views
- Use FormModal for all CRUD operations
- Implement breadcrumb navigation
- Add confirmation dialogs for delete operations
