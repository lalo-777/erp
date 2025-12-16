import { sequelize } from '../config/mysql';
import * as fs from 'fs';
import * as path from 'path';

async function setupPreInventory() {
  try {
    await sequelize.authenticate();
    console.log('Connected to MySQL successfully');

    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '../../sql/pre_inventory.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf-8');

    // Split SQL statements (simple split by semicolon)
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log(`Executing ${statements.length} SQL statements...`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        console.log(`\nExecuting statement ${i + 1}/${statements.length}...`);
        await sequelize.query(statement);
        console.log(`Statement ${i + 1} executed successfully`);
      }
    }

    console.log('\n========================================');
    console.log('Pre-inventory tables created successfully!');
    console.log('========================================');
    console.log('Tables created:');
    console.log('- pre_inventory');
    console.log('- cat_pre_inventory_status');
    console.log('========================================');

    process.exit(0);
  } catch (error) {
    console.error('Error setting up pre-inventory tables:', error);
    process.exit(1);
  }
}

setupPreInventory();
