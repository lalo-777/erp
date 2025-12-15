import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-materials-tracking',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col-12">
          <a routerLink="/materials" class="btn btn-link p-0 mb-2">
            <span class="material-symbols-outlined">arrow_back</span> Volver a Materiales
          </a>
          <h2>Detalle de Material</h2>
        </div>
      </div>
      <div class="alert alert-info">
        <strong>En desarrollo:</strong> Detalles del material en construcción.
      </div>
    </div>
  `,
})
export class MaterialsTrackingComponent {}
