import { sequelize } from '../config/mysql';
import * as fs from 'fs';
import * as path from 'path';

async function recreatePreInventory() {
  try {
    await sequelize.authenticate();
    console.log('Connected to MySQL successfully');

    console.log('\n⚠️  WARNING: This will DROP and RECREATE the pre_inventory table!');
    console.log('Any existing data will be LOST.\n');

    // Drop existing tables
    console.log('Dropping existing tables...');

    // First, drop foreign key constraints if they exist
    try {
      await sequelize.query('ALTER TABLE pre_inventory DROP FOREIGN KEY IF EXISTS fk_preinv_material');
      await sequelize.query('ALTER TABLE pre_inventory DROP FOREIGN KEY IF EXISTS fk_preinv_location');
      await sequelize.query('ALTER TABLE pre_inventory DROP FOREIGN KEY IF EXISTS fk_preinv_counted_by');
      await sequelize.query('ALTER TABLE pre_inventory DROP FOREIGN KEY IF EXISTS fk_preinv_created_by');
      await sequelize.query('ALTER TABLE pre_inventory DROP FOREIGN KEY IF EXISTS fk_preinv_updated_by');
      await sequelize.query('ALTER TABLE pre_inventory DROP FOREIGN KEY IF EXISTS fk_preinv_adjustment');
    } catch (error) {
      // Ignore errors if constraints don't exist
    }

    await sequelize.query('DROP TABLE IF EXISTS pre_inventory');
    await sequelize.query('DROP TABLE IF EXISTS cat_pre_inventory_status');
    console.log('✓ Old tables dropped');

    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '../../sql/pre_inventory.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf-8');

    // Split SQL statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log(`\nCreating tables with correct structure...`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        console.log(`  Executing statement ${i + 1}/${statements.length}...`);
        await sequelize.query(statement);
      }
    }

    console.log('\n========================================');
    console.log('✓ Pre-inventory tables recreated successfully!');
    console.log('========================================');
    console.log('Tables created:');
    console.log('  • pre_inventory (with correct structure)');
    console.log('  • cat_pre_inventory_status');
    console.log('========================================');

    // Verify structure
    console.log('\nVerifying table structure...');
    const columns = await sequelize.query("DESCRIBE pre_inventory");
    const columnNames = (columns[0] as any).map((col: any) => col.Field);

    const requiredColumns = [
      'id', 'pre_inventory_number', 'material_id', 'warehouse_location_id',
      'expected_quantity', 'counted_quantity', 'discrepancy', 'unit_cost',
      'discrepancy_value', 'status_id', 'notes', 'count_date', 'counted_by',
      'adjusted', 'adjustment_transaction_id', 'created_by', 'created_date',
      'updated_by', 'updated_date'
    ];

    let allPresent = true;
    for (const col of requiredColumns) {
      if (columnNames.includes(col)) {
        console.log(`  ✓ ${col}`);
      } else {
        console.log(`  ❌ ${col} - MISSING`);
        allPresent = false;
      }
    }

    if (allPresent) {
      console.log('\n✓ All required columns are present!');
    } else {
      console.log('\n❌ Some columns are still missing!');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error recreating pre-inventory tables:', error);
    process.exit(1);
  }
}

recreatePreInventory();
