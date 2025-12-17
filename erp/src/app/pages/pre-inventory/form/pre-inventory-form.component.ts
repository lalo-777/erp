import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { PreInventoryService } from '../../../services/pre-inventory.service';
import { MaterialService } from '../../../services/material.service';
import { WarehouseService } from '../../../services/warehouse.service';
import { ToastService } from '../../../services/toast.service';
import { Material } from '../../../models/material.model';
import { WarehouseLocation } from '../../../models/warehouse.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-pre-inventory-form',
  imports: [
    MatIconModule,
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './pre-inventory-form.component.html',
  styleUrl: './pre-inventory-form.component.scss',
})
export class PreInventoryFormComponent implements OnInit {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private preInventoryService = inject(PreInventoryService);
  private materialService = inject(MaterialService);
  private warehouseService = inject(WarehouseService);
  private toastService = inject(ToastService);

  // Signals
  materials = signal<Material[]>([]);
  locations = signal<WarehouseLocation[]>([]);
  isLoading = signal(false);
  isLoadingMaterials = signal(false);
  isLoadingLocations = signal(false);
  isSaving = signal(false);

  // Search
  materialSearchTerm = signal('');
  private searchSubject = new Subject<string>();

  // Form
  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      material_id: [null, [Validators.required]],
      warehouse_location_id: [null, [Validators.required]],
      count_date: [this.getTodayDate()],
      notes: [''],
    });
  }

  ngOnInit(): void {
    this.loadLocations();
    this.loadMaterials();

    // Setup debounced search
    this.searchSubject.pipe(debounceTime(300)).subscribe((term) => {
      this.loadMaterials(term);
    });
  }

  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  loadLocations(): void {
    this.isLoadingLocations.set(true);

    this.warehouseService.getAllLocations().subscribe({
      next: (response) => {
        if (response.success) {
          this.locations.set(response.data);
        }
        this.isLoadingLocations.set(false);
      },
      error: (err) => {
        console.error('Error loading locations:', err);
        this.toastService.showError('Error al cargar ubicaciones');
        this.isLoadingLocations.set(false);
      },
    });
  }

  loadMaterials(search?: string): void {
    this.isLoadingMaterials.set(true);

    this.materialService.getAllMaterials(1, 100, search).subscribe({
      next: (response) => {
        if (response.success) {
          this.materials.set(response.data);
        }
        this.isLoadingMaterials.set(false);
      },
      error: (err) => {
        console.error('Error loading materials:', err);
        this.toastService.showError('Error al cargar materiales');
        this.isLoadingMaterials.set(false);
      },
    });
  }

  onMaterialSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.materialSearchTerm.set(input.value);
    this.searchSubject.next(input.value);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastService.showError('Por favor complete todos los campos requeridos');
      return;
    }

    this.isSaving.set(true);

    const formData = this.form.value;

    this.preInventoryService.createPreInventory(formData).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.showSuccess('Conteo de pre-inventario creado correctamente');
          this.router.navigate(['/pre-inventory/detail', response.data.id]);
        }
        this.isSaving.set(false);
      },
      error: (err) => {
        console.error('Error creating pre-inventory:', err);
        this.toastService.showError(err.error?.message || 'Error al crear conteo de pre-inventario');
        this.isSaving.set(false);
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/pre-inventory']);
  }

  getSelectedMaterial(): Material | undefined {
    const materialId = this.form.get('material_id')?.value;
    return this.materials().find((m) => m.id === materialId);
  }

  getSelectedLocation(): WarehouseLocation | undefined {
    const locationId = this.form.get('warehouse_location_id')?.value;
    return this.locations().find((l) => l.id === locationId);
  }
}
