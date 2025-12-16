import { sequelize } from '../config/mysql';
import { QueryTypes } from 'sequelize';

async function checkTableStructure() {
  try {
    await sequelize.authenticate();
    console.log('Connected to MySQL successfully');

    // Check if table exists
    const [tables] = await sequelize.query(
      "SHOW TABLES LIKE 'pre_inventory'",
      { type: QueryTypes.SELECT }
    ) as any;

    if (!tables || Object.keys(tables).length === 0) {
      console.log('❌ Table pre_inventory does NOT exist');
      process.exit(0);
    }

    console.log('✓ Table pre_inventory exists');
    console.log('\nCurrent table structure:');
    console.log('========================================');

    // Get table structure
    const columns = await sequelize.query(
      "DESCRIBE pre_inventory",
      { type: QueryTypes.SELECT }
    );

    console.log(columns);

    console.log('\n========================================');
    console.log('Checking for required columns:');

    const columnNames = (columns as any).map((col: any) => col.Field);
    const requiredColumns = [
      'id', 'pre_inventory_number', 'material_id', 'warehouse_location_id',
      'expected_quantity', 'counted_quantity', 'discrepancy', 'unit_cost',
      'discrepancy_value', 'status_id', 'notes', 'count_date', 'counted_by',
      'adjusted', 'adjustment_transaction_id', 'created_by', 'created_date',
      'updated_by', 'updated_date'
    ];

    let missingColumns = [];
    for (const col of requiredColumns) {
      if (columnNames.includes(col)) {
        console.log(`  ✓ ${col}`);
      } else {
        console.log(`  ❌ ${col} - MISSING`);
        missingColumns.push(col);
      }
    }

    if (missingColumns.length > 0) {
      console.log('\n❌ Table structure is incomplete!');
      console.log('Missing columns:', missingColumns.join(', '));
    } else {
      console.log('\n✓ Table structure is complete!');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error checking table structure:', error);
    process.exit(1);
  }
}

checkTableStructure();
