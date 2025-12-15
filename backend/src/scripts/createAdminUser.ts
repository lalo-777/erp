import { sequelize } from '../config/mysql';
import { People } from '../models/mysql/People';
import { UserMySQL } from '../models/mysql/UserMySQL';

async function createAdminUser() {
  try {
    await sequelize.authenticate();
    console.log('Connected to MySQL successfully');

    // Check if admin user already exists
    const existingUser = await UserMySQL.findOne({ where: { email: 'admin@erp.com' } });

    if (existingUser) {
      console.log('Admin user already exists!');
      process.exit(0);
    }

    // Create person record
    const person = await People.create({
      person_names: 'Administrator',
      last_name1: 'System',
      last_name2: 'User',
      gender_id: 1,
      birth_date: new Date('1990-01-01'),
      person_title_id: 1,
      marital_status_id: 1,
      rfc: 'ADMIN000000XX',
      curp: 'ADMIN00000HXXXXXX0',
      phone1: '0000000000',
      email: 'admin@erp.com',
      nationality_id: 1,
      is_active: 1,
    });

    console.log('Person record created with ID:', person.id);

    // Create user record
    const user = await UserMySQL.create({
      person_id: person.id,
      role_id: 1, // Administrator role
      email: 'admin@erp.com',
      usr_password: 'admin123', // Will be hashed by the model hook
      username: 'Administrator',
      lastname: 'System User',
      usr_active: 1,
      is_generic: 0,
    });

    console.log('========================================');
    console.log('Admin user created successfully!');
    console.log('========================================');
    console.log('Email:', user.email);
    console.log('Password: admin123');
    console.log('Role ID:', user.role_id);
    console.log('========================================');
    console.log('IMPORTANT: Change this password after first login!');
    console.log('========================================');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
