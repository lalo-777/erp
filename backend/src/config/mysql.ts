import { Sequelize } from 'sequelize';
import { config } from './environment';

export const sequelize = new Sequelize({
  host: config.mysqlHost,
  port: config.mysqlPort,
  database: config.mysqlDatabase,
  username: config.mysqlUser,
  password: config.mysqlPassword,
  dialect: 'mysql',
  logging: config.nodeEnv === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true,
  },
});

export const connectMySQL = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('MySQL connected successfully');

    // Model synchronization: Use { alter: true } in development environment to automatically update table schemas
    // await sequelize.sync({ alter: config.nodeEnv === 'development' });

  } catch (error) {
    console.error('Failed to connect to MySQL:', error);
    throw error;
  }
};

export const disconnectMySQL = async (): Promise<void> => {
  try {
    await sequelize.close();
    console.log('MySQL disconnected successfully');
  } catch (error) {
    console.error('Error disconnecting from MySQL:', error);
    throw error;
  }
};
