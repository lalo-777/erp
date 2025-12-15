# Customers Module Frontend

## Phase Status: Not Started (0/6)

## Backend Status
✅ COMPLETE - All CRUD endpoints working
- GET `/api/customers` - List with pagination
- GET `/api/customers/:id` - Get by ID
- POST `/api/customers` - Create
- PUT `/api/customers/:id` - Update
- DELETE `/api/customers/:id` - Soft delete
- GET `/api/customers/stats` - Statistics

## Frontend Tasks

### 1. Customers Dashboard
**File:** `D:\erp\servidor\erp\src\app\pages\customers\dashboard\customers-dashboard.component.ts`

- [ ] Inject CustomerService and ToastService
- [ ] Create signals: `customers`, `isLoading`, `pagination`, `searchTerm`
- [ ] Implement `loadCustomers()` method with pagination
- [ ] Implement `onPageChange()` handler
- [ ] Implement `onSearch()` with debounce
- [ ] Implement `onNew Customer()` - open modal
- [ ] Implement `onEdit()` - open modal with data
- [ ] Implement `onDelete()` - show confirm dialog
- [ ] Implement `onView()` - navigate to tracking page

**HTML:**
- [ ] Add page header with title and "New Customer" button
- [ ] Add search bar
- [ ] Add stats cards (total customers, active, new this month)
- [ ] Use DataTable component with customer columns
- [ ] Add loading spinner
- [ ] Add empty state for no customers

**Columns:** ID, Company Name, RFC, Contact Name, Email, Phone, Status, Actions

### 2. New Customer Modal
**File:** `D:\erp\servidor\erp\src\app\components\new-customer-modal\new-customer-modal.component.ts`

**Reference:** `D:\crm\crmii\src\app\components\new-contact-modal\new-contact-modal.component.ts`

- [ ] Create component with ReactiveFormsModule
- [ ] Define customer form with FormBuilder
  - [ ] company_name (required)
  - [ ] rfc (required, pattern validation)
  - [ ] contact_name
  - [ ] contact_email (email validation)
  - [ ] contact_phone
  - [ ] address
  - [ ] city
  - [ ] state
  - [ ] postal_code
  - [ ] status (default: active)
- [ ] Add form validation
- [ ] Implement `onSubmit()` with loading state
- [ ] Add success toast notification
- [ ] Add error handling
- [ ] Emit `customerCreated` event
- [ ] Support edit mode (pass customer ID)

**HTML:**
- [ ] Use FormModal component
- [ ] Create two-column form layout
- [ ] Add validation error messages
- [ ] Add loading spinner on submit button

### 3. Customer Tracking Page
**File:** `D:\erp\servidor\erp\src\app\pages\customers\tracking\customer-tracking.component.ts`

- [ ] Get customer ID from route params
- [ ] Load customer details
- [ ] Create sections: details, invoices, projects, notes, files
- [ ] Implement `onEdit()` - open modal
- [ ] Implement `onDelete()` - confirm and navigate back

**HTML:**
- [ ] Add breadcrumb navigation
- [ ] Display customer header (company name, RFC)
- [ ] Show customer details in cards
- [ ] Show related invoices table
- [ ] Show related projects table
- [ ] Show notes section
- [ ] Show files section
- [ ] Add edit and delete buttons

### 4. Customer Service Enhancement
**File:** `D:\erp\servidor\erp\src\app\services\customer.service.ts`

- [ ] Add `getCustomerStats()` method
- [ ] Add `searchCustomers(term: string)` method
- [ ] Ensure error handling in all methods
- [ ] Add proper TypeScript interfaces

### 5. Customer Models
**File:** `D:\erp\servidor\erp\src\app\models\customer.model.ts`

- [ ] Define `Customer` interface (full model)
- [ ] Define `CustomerListItem` interface (table display)
- [ ] Define `CreateCustomerRequest` interface
- [ ] Define `UpdateCustomerRequest` interface
- [ ] Define `CustomerStats` interface

### 6. Integration Testing
- [ ] Test create customer flow
- [ ] Test edit customer flow
- [ ] Test delete customer flow
- [ ] Test search functionality
- [ ] Test pagination
- [ ] Test navigation to tracking page
- [ ] Test form validation
- [ ] Test error handling

## User Flow

1. User clicks "Clientes" in sidebar
2. Dashboard loads with customer list
3. User clicks "Nuevo Cliente"
4. Modal opens with form
5. User fills form and submits
6. Toast shows success
7. Modal closes
8. List refreshes with new customer
9. User clicks customer row
10. Tracking page shows full details

## Notes

- Backend is ready - focus on frontend only
- Copy modal pattern from CRM new-contact-modal
- Use DataTable component for list
- Use FormModal component for create/edit
- Use ConfirmDialog for delete
- Use Toast for all notifications
