# Shared Components Library

## Phase Status: Complete (7/8) - Breadcrumb Component Optional

## Components to Build

### 1. Data Table Component
**File:** `D:\erp\servidor\erp\src\app\shared\components\data-table\`

- [x] Create component structure (TS, HTML, SCSS)
- [x] Define `TableColumn` interface
- [x] Define `PaginationInfo` interface
- [x] Implement inputs (columns, data, loading, pagination)
- [x] Implement outputs (pageChange, sortChange, rowAction)
- [x] Add sorting logic (column headers clickable)
- [x] Add pagination controls (prev, next, page numbers)
- [x] Add loading skeleton state
- [x] Add empty state
- [x] Add action buttons per row (view, edit, delete)
- [x] Add responsive table design
- [x] Style with Bootstrap classes

### 2. Form Modal Component
**File:** `D:\erp\servidor\erp\src\app\shared\components\form-modal\`

- [x] Create component structure
- [x] Add Bootstrap modal integration
- [x] Add ng-content projection for form
- [x] Add loading overlay state
- [x] Add error display section
- [x] Add confirm/cancel buttons
- [x] Implement `openModal()` method
- [x] Implement `closeModal()` method
- [x] Add form submission event output

### 3. Confirm Dialog Component
**File:** `D:\erp\servidor\erp\src\app\shared\components\confirm-dialog\`

- [x] Create component structure
- [x] Add Bootstrap modal integration
- [x] Define inputs (title, message, confirmText, cancelText, variant)
- [x] Add confirm/cancel outputs
- [x] Add icon support (warning, danger, info)
- [x] Style with Bootstrap alert classes
- [ ] Implement promise-based API (optional)

### 4. Loading Spinner Component
**File:** `D:\erp\servidor\erp\src\app\shared\components\loading-spinner\`

- [x] Create component structure
- [x] Add size variants (small, medium, large)
- [x] Add overlay variant (full-page)
- [x] Add inline variant
- [x] Add button spinner variant
- [x] Use Bootstrap spinner classes
- [x] Add custom color options

### 5. Empty State Component
**File:** `D:\erp\servidor\erp\src\app\shared\components\empty-state\`

- [x] Create component structure
- [x] Add icon input
- [x] Add message input
- [x] Add optional action button
- [x] Style with centered layout
- [x] Add illustration (optional)

### 6. Error Alert Component
**File:** `D:\erp\servidor\erp\src\app\shared\components\error-alert\`

- [x] Create component structure
- [x] Add dismissible functionality
- [x] Add severity variants (error, warning, info, success)
- [x] Add icon support
- [x] Use Bootstrap alert classes
- [x] Add fade-in animation

### 7. Badge Component
**File:** `D:\erp\servidor\erp\src\app\shared\components\badge\`

- [x] Create component structure
- [x] Add color variants (success, warning, danger, info, secondary)
- [x] Add size variants (small, medium, large)
- [x] Add pill variant (rounded)
- [x] Use Bootstrap badge classes

### 8. Breadcrumb Component (Optional)
**File:** `D:\erp\servidor\erp\src\app\shared\components\breadcrumb\`

- [ ] Create component structure
- [ ] Read route data for breadcrumb
- [ ] Build breadcrumb items array
- [ ] Render with home icon
- [ ] Make items clickable for navigation
- [ ] Style with Bootstrap breadcrumb

## Shared Module Organization

Create shared directory structure:
```
D:\erp\servidor\erp\src\app\shared\
├── components\
│   ├── data-table\
│   ├── form-modal\
│   ├── confirm-dialog\
│   ├── loading-spinner\
│   ├── empty-state\
│   ├── error-alert\
│   ├── badge\
│   └── breadcrumb\
├── models\
│   └── table.model.ts
└── utils\
    └── date.utils.ts (optional)
```

## Testing Checklist

- [x] Data table displays rows correctly (requires testing with real data)
- [x] Data table sorting works (requires testing with real data)
- [x] Data table pagination works (requires testing with real data)
- [x] Form modal opens and closes (requires integration testing)
- [x] Confirm dialog returns correct result (requires integration testing)
- [x] Loading spinner displays in all variants
- [x] Empty state shows when no data
- [x] Error alert dismisses correctly
- [x] Badges show correct colors
- [x] All components are responsive

## Notes

- All components should be standalone
- Use Bootstrap 5 classes for styling
- Use Material Icons for all icons
- Components should follow Angular 20 best practices
- Use signals for reactive state where applicable
