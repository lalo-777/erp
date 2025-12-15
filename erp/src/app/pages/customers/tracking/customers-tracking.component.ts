import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-customers-tracking',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col-12">
          <a routerLink="/customers" class="btn btn-link p-0 mb-2">
            <span class="material-symbols-outlined">arrow_back</span> Volver a Clientes
          </a>
          <h2>Detalle de Cliente</h2>
        </div>
      </div>
      <div class="alert alert-info">
        <strong>En desarrollo:</strong> Detalles del cliente en construcción.
      </div>
    </div>
  `,
})
export class CustomersTrackingComponent {}
