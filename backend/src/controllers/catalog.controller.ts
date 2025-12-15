import { Request, Response } from 'express';
import { sequelize } from '../config/mysql';
import { QueryTypes } from 'sequelize';
import * as models from '../models/mysql';

/**
 * Catalog model mapping
 * Maps catalog names to their corresponding Sequelize models
 */
const catalogModels: Record<string, any> = {
  'roles': models.Role,
  'genders': models.Gender,
  'marital-statuses': models.MaritalStatus,
  'person-titles': models.PersonTitle,
  'nationalities': models.Nationality,
  'states': models.State,
  'invoice-types': models.InvoiceType,
  'invoice-statuses': models.InvoiceStatus,
  'payment-methods': models.PaymentMethod,
  'payment-statuses': models.PaymentStatus,
  'expense-categories': models.ExpenseCategory,
  'expense-statuses': models.ExpenseStatus,
  'project-statuses': models.ProjectStatus,
  'project-types': models.ProjectType,
  'project-areas': models.ProjectArea,
  'contract-types': models.ContractType,
  'contract-statuses': models.ContractStatus,
  'work-order-types': models.WorkOrderType,
  'work-order-statuses': models.WorkOrderStatus,
  'labor-types': models.LaborType,
  'units-of-measure': models.UnitOfMeasure,
  'material-categories': models.MaterialCategory,
  'warehouse-locations': models.WarehouseLocation,
  'transaction-types': models.TransactionType,
  'supplier-categories': models.SupplierCategory,
  'purchase-order-statuses': models.PurchaseOrderStatus,
  'fuel-types': models.FuelType,
  'ml-models': models.MLModel,
};

/**
 * Catalog table name mapping
 */
const catalogTables: Record<string, string> = {
  'roles': 'cat_roles',
  'genders': 'cat_genders',
  'marital-statuses': 'cat_marital_statuses',
  'person-titles': 'cat_person_titles',
  'nationalities': 'cat_nationalities',
  'states': 'cat_states',
  'invoice-types': 'cat_invoice_types',
  'invoice-statuses': 'cat_invoice_statuses',
  'payment-methods': 'cat_payment_methods',
  'payment-statuses': 'cat_payment_statuses',
  'expense-categories': 'cat_expense_categories',
  'expense-statuses': 'cat_expense_statuses',
  'project-statuses': 'cat_project_statuses',
  'project-types': 'cat_project_types',
  'project-areas': 'cat_project_areas',
  'contract-types': 'cat_contract_types',
  'contract-statuses': 'cat_contract_statuses',
  'work-order-types': 'cat_work_order_types',
  'work-order-statuses': 'cat_work_order_statuses',
  'labor-types': 'cat_labor_types',
  'units-of-measure': 'cat_unit_of_measure',
  'material-categories': 'cat_material_categories',
  'warehouse-locations': 'cat_warehouse_locations',
  'transaction-types': 'cat_transaction_types',
  'supplier-categories': 'cat_supplier_categories',
  'purchase-order-statuses': 'cat_purchase_order_statuses',
  'fuel-types': 'cat_fuel_types',
  'ml-models': 'cat_ml_models',
};

/**
 * Get all catalogs list
 */
export const getAllCatalogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const catalogs = Object.keys(catalogModels).map(key => ({
      name: key,
      table: catalogTables[key],
    }));

    res.status(200).json({
      success: true,
      data: catalogs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve catalogs list',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get all entries from a specific catalog
 */
export const getCatalogEntries = async (req: Request, res: Response): Promise<void> => {
  try {
    const { catalogName } = req.params;
    const model = catalogModels[catalogName];
    const tableName = catalogTables[catalogName];

    if (!model || !tableName) {
      res.status(404).json({
        success: false,
        message: `Catalog '${catalogName}' not found`,
      });
      return;
    }

    const entries = await sequelize.query(
      `SELECT * FROM ${tableName} ORDER BY id ASC`,
      { type: QueryTypes.SELECT }
    );

    res.status(200).json({
      success: true,
      data: entries,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve catalog entries',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get single catalog entry by ID
 */
export const getCatalogEntryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { catalogName, id } = req.params;
    const model = catalogModels[catalogName];
    const tableName = catalogTables[catalogName];

    if (!model || !tableName) {
      res.status(404).json({
        success: false,
        message: `Catalog '${catalogName}' not found`,
      });
      return;
    }

    const entries = await sequelize.query(
      `SELECT * FROM ${tableName} WHERE id = :id`,
      {
        replacements: { id },
        type: QueryTypes.SELECT
      }
    );

    if (entries.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Catalog entry not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: entries[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve catalog entry',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Create new catalog entry
 */
export const createCatalogEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { catalogName } = req.params;
    const model = catalogModels[catalogName];

    if (!model) {
      res.status(404).json({
        success: false,
        message: `Catalog '${catalogName}' not found`,
      });
      return;
    }

    const entry = await model.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Catalog entry created successfully',
      data: entry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create catalog entry',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Update catalog entry
 */
export const updateCatalogEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { catalogName, id } = req.params;
    const model = catalogModels[catalogName];

    if (!model) {
      res.status(404).json({
        success: false,
        message: `Catalog '${catalogName}' not found`,
      });
      return;
    }

    const [affectedRows] = await model.update(req.body, {
      where: { id },
    });

    if (affectedRows === 0) {
      res.status(404).json({
        success: false,
        message: 'Catalog entry not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Catalog entry updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update catalog entry',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Delete catalog entry
 */
export const deleteCatalogEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { catalogName, id } = req.params;
    const model = catalogModels[catalogName];

    if (!model) {
      res.status(404).json({
        success: false,
        message: `Catalog '${catalogName}' not found`,
      });
      return;
    }

    const affectedRows = await model.destroy({
      where: { id },
    });

    if (affectedRows === 0) {
      res.status(404).json({
        success: false,
        message: 'Catalog entry not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Catalog entry deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete catalog entry',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
