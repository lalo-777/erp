import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col-12">
          <h2>Panel de Administración</h2>
          <p class="text-muted">Gestión y configuración del sistema ERP</p>
        </div>
      </div>

      <!-- Admin Modules Grid -->
      <div class="row g-4">
        <!-- Users Management -->
        <div class="col-md-6 col-lg-4">
          <div class="card h-100 shadow-sm admin-card" routerLink="/admin/users">
            <div class="card-body">
              <div class="d-flex align-items-center mb-3">
                <div class="admin-icon me-3 bg-primary bg-opacity-10">
                  <i class="bi bi-people fs-2 text-primary"></i>
                </div>
                <div>
                  <h5 class="card-title mb-0">Gestión de Usuarios</h5>
                  <p class="text-muted mb-0 small">Administrar usuarios</p>
                </div>
              </div>
              <p class="card-text">
                Crear, editar y gestionar usuarios del sistema. Asignar roles y controlar accesos.
              </p>
              <div class="d-flex justify-content-end">
                <i class="bi bi-chevron-right text-primary"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Catalogs Management -->
        <div class="col-md-6 col-lg-4">
          <div class="card h-100 shadow-sm admin-card" routerLink="/admin/catalogs">
            <div class="card-body">
              <div class="d-flex align-items-center mb-3">
                <div class="admin-icon me-3 bg-success bg-opacity-10">
                  <i class="bi bi-list-ul fs-2 text-success"></i>
                </div>
                <div>
                  <h5 class="card-title mb-0">Catálogos del Sistema</h5>
                  <p class="text-muted mb-0 small">28 catálogos disponibles</p>
                </div>
              </div>
              <p class="card-text">
                Administrar catálogos del sistema como roles, estados, tipos de proyecto, etc.
              </p>
              <div class="d-flex justify-content-end">
                <i class="bi bi-chevron-right text-success"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- System Settings -->
        <div class="col-md-6 col-lg-4">
          <div class="card h-100 shadow-sm admin-card disabled">
            <div class="card-body">
              <div class="d-flex align-items-center mb-3">
                <div class="admin-icon me-3 bg-warning bg-opacity-10">
                  <i class="bi bi-gear fs-2 text-warning"></i>
                </div>
                <div>
                  <h5 class="card-title mb-0">Configuración</h5>
                  <p class="text-muted mb-0 small">Próximamente</p>
                </div>
              </div>
              <p class="card-text">
                Configurar parámetros del sistema, información de la empresa y preferencias.
              </p>
              <span class="badge bg-secondary">En desarrollo</span>
            </div>
          </div>
        </div>

        <!-- Audit Logs -->
        <div class="col-md-6 col-lg-4">
          <div class="card h-100 shadow-sm admin-card disabled">
            <div class="card-body">
              <div class="d-flex align-items-center mb-3">
                <div class="admin-icon me-3 bg-info bg-opacity-10">
                  <i class="bi bi-clock-history fs-2 text-info"></i>
                </div>
                <div>
                  <h5 class="card-title mb-0">Auditoría</h5>
                  <p class="text-muted mb-0 small">Próximamente</p>
                </div>
              </div>
              <p class="card-text">
                Ver historial de cambios y auditoría de operaciones del sistema.
              </p>
              <span class="badge bg-secondary">Opcional</span>
            </div>
          </div>
        </div>

        <!-- Reports -->
        <div class="col-md-6 col-lg-4">
          <div class="card h-100 shadow-sm admin-card disabled">
            <div class="card-body">
              <div class="d-flex align-items-center mb-3">
                <div class="admin-icon me-3 bg-danger bg-opacity-10">
                  <i class="bi bi-file-earmark-bar-graph fs-2 text-danger"></i>
                </div>
                <div>
                  <h5 class="card-title mb-0">Reportes</h5>
                  <p class="text-muted mb-0 small">Futuro</p>
                </div>
              </div>
              <p class="card-text">
                Generar y exportar reportes del sistema en diversos formatos.
              </p>
              <span class="badge bg-secondary">Futuro</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-card {
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .admin-card:not(.disabled):hover {
      transform: translateY(-5px);
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
    }

    .admin-card.disabled {
      cursor: not-allowed;
      opacity: 0.7;
    }

    .admin-icon {
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
    }
  `],
})
export class AdminDashboardComponent {}
