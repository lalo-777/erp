# Shared Components Library

## Phase Status: Not Started (0/8)

## Components to Build

### 1. Data Table Component
**File:** `D:\erp\servidor\erp\src\app\shared\components\data-table\`

- [ ] Create component structure (TS, HTML, SCSS)
- [ ] Define `TableColumn` interface
- [ ] Define `PaginationInfo` interface
- [ ] Implement inputs (columns, data, loading, pagination)
- [ ] Implement outputs (pageChange, sortChange, rowAction)
- [ ] Add sorting logic (column headers clickable)
- [ ] Add pagination controls (prev, next, page numbers)
- [ ] Add loading skeleton state
- [ ] Add empty state
- [ ] Add action buttons per row (view, edit, delete)
- [ ] Add responsive table design
- [ ] Style with Bootstrap classes

### 2. Form Modal Component
**File:** `D:\erp\servidor\erp\src\app\shared\components\form-modal\`

- [ ] Create component structure
- [ ] Add Bootstrap modal integration
- [ ] Add ng-content projection for form
- [ ] Add loading overlay state
- [ ] Add error display section
- [ ] Add confirm/cancel buttons
- [ ] Implement `openModal()` method
- [ ] Implement `closeModal()` method
- [ ] Add form submission event output

### 3. Confirm Dialog Component
**File:** `D:\erp\servidor\erp\src\app\shared\components\confirm-dialog\`

- [ ] Create component structure
- [ ] Add Bootstrap modal integration
- [ ] Define inputs (title, message, confirmText, cancelText, variant)
- [ ] Add confirm/cancel outputs
- [ ] Add icon support (warning, danger, info)
- [ ] Style with Bootstrap alert classes
- [ ] Implement promise-based API (optional)

### 4. Loading Spinner Component
**File:** `D:\erp\servidor\erp\src\app\shared\components\loading-spinner\`

- [ ] Create component structure
- [ ] Add size variants (small, medium, large)
- [ ] Add overlay variant (full-page)
- [ ] Add inline variant
- [ ] Add button spinner variant
- [ ] Use Bootstrap spinner classes
- [ ] Add custom color options

### 5. Empty State Component
**File:** `D:\erp\servidor\erp\src\app\shared\components\empty-state\`

- [ ] Create component structure
- [ ] Add icon input
- [ ] Add message input
- [ ] Add optional action button
- [ ] Style with centered layout
- [ ] Add illustration (optional)

### 6. Error Alert Component
**File:** `D:\erp\servidor\erp\src\app\shared\components\error-alert\`

- [ ] Create component structure
- [ ] Add dismissible functionality
- [ ] Add severity variants (error, warning, info, success)
- [ ] Add icon support
- [ ] Use Bootstrap alert classes
- [ ] Add fade-in animation

### 7. Badge Component
**File:** `D:\erp\servidor\erp\src\app\shared\components\badge\`

- [ ] Create component structure
- [ ] Add color variants (success, warning, danger, info, secondary)
- [ ] Add size variants (small, medium, large)
- [ ] Add pill variant (rounded)
- [ ] Use Bootstrap badge classes

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

- [ ] Data table displays rows correctly
- [ ] Data table sorting works
- [ ] Data table pagination works
- [ ] Form modal opens and closes
- [ ] Confirm dialog returns correct result
- [ ] Loading spinner displays in all variants
- [ ] Empty state shows when no data
- [ ] Error alert dismisses correctly
- [ ] Badges show correct colors
- [ ] All components are responsive

## Notes

- All components should be standalone
- Use Bootstrap 5 classes for styling
- Use Material Icons for all icons
- Components should follow Angular 20 best practices
- Use signals for reactive state where applicable
