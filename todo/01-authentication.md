# Authentication & Core Infrastructure

## Phase Status: In Progress (1/7)

## Tasks

### Toast Service
- [x] Copy `D:\crm\crmii\src\app\services\toast.service.ts`
- [x] Create `D:\erp\servidor\erp\src\app\services\toast.service.ts`
- [x] Test toast notifications (success, error, info, warning)

### Login Component Improvements
- [ ] Update TypeScript file with ReactiveFormsModule
  - [ ] Add FormBuilder with validators
  - [ ] Add password visibility toggle signal
  - [ ] Add form validation logic
  - [ ] Integrate toast service for errors
- [ ] Update HTML template
  - [ ] Add password visibility toggle button
  - [ ] Add validation error messages
  - [ ] Add loading spinner
  - [ ] Update form bindings to reactive forms
- [ ] Update SCSS styling
  - [ ] Copy gradient background from CRM
  - [ ] Add card shadow effects
  - [ ] Add form input animations
  - [ ] Add responsive design

**Files:**
- Source: `D:\crm\crmii\src\app\components\login\login.component.*`
- Target: `D:\erp\servidor\erp\src\app\components\login\login.component.*`

### Profile Component
- [ ] Create `profile.component.ts`
- [ ] Create `profile.component.html`
- [ ] Create `profile.component.scss`
- [ ] Add route `/profile`
- [ ] Link from user dropdown menu

### Settings Component
- [ ] Create `settings.component.ts`
- [ ] Create `settings.component.html`
- [ ] Create `settings.component.scss`
- [ ] Add route `/settings`
- [ ] Link from user dropdown menu

## Testing Checklist

- [ ] Toast notifications display correctly
- [ ] Login form validation works
- [ ] Password visibility toggle works
- [ ] Login submits and redirects on success
- [ ] Error toasts show on failed login
- [ ] Loading spinner shows during submission
- [ ] Mobile responsive design works
- [ ] Profile page displays user info
- [ ] Settings page accessible

## Notes

- Toast service can be copied directly with no changes
- Login component needs significant updates
- Use Material Icons for all icons
- Follow CRM gradient design pattern
