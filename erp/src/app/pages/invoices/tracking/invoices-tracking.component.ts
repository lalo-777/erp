import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-invoices-tracking',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col-12">
          <a routerLink="/invoices" class="btn btn-link p-0 mb-2">
            <span class="material-symbols-outlined">arrow_back</span> Volver a Facturas
          </a>
          <h2>Detalle de Factura</h2>
        </div>
      </div>
      <div class="alert alert-info">
        <strong>En desarrollo:</strong> Detalles de la factura en construcción.
      </div>
    </div>
  `,
})
export class InvoicesTrackingComponent {}
