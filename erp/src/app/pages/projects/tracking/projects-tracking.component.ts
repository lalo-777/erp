import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-projects-tracking',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col-12">
          <a routerLink="/projects" class="btn btn-link p-0 mb-2">
            <span class="material-symbols-outlined">arrow_back</span> Volver a Proyectos
          </a>
          <h2>Detalle de Proyecto</h2>
        </div>
      </div>
      <div class="alert alert-info">
        <strong>En desarrollo:</strong> Detalles del proyecto en construcción.
      </div>
    </div>
  `,
})
export class ProjectsTrackingComponent {}
