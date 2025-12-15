import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-customers-dashboard',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col-12">
          <h2>Clientes</h2>
          <p class="text-muted">Gestión de clientes del sistema</p>
        </div>
      </div>
      <div class="alert alert-info">
        <strong>En desarrollo:</strong> Este módulo está listo para ser implementado.
      </div>
    </div>
  `,
})
export class CustomersDashboardComponent {}
