import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

interface Config {
  port: number;
  nodeEnv: string;
  mysqlHost: string;
  mysqlPort: number;
  mysqlUser: string;
  mysqlPassword: string;
  mysqlDatabase: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  corsOrigin: string;
}

const getEnvVariable = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value;
};

export const config: Config = {
  port: parseInt(getEnvVariable('PORT', '3001'), 10),
  nodeEnv: getEnvVariable('NODE_ENV', 'development'),
  mysqlHost: getEnvVariable('MYSQL_HOST', 'localhost'),
  mysqlPort: parseInt(getEnvVariable('MYSQL_PORT', '3306'), 10),
  mysqlUser: getEnvVariable('MYSQL_USER', 'root'),
  mysqlPassword: getEnvVariable('MYSQL_PASSWORD', ''),
  mysqlDatabase: getEnvVariable('MYSQL_DATABASE', 'erp_development'),
  jwtSecret: getEnvVariable('JWT_SECRET'),
  jwtExpiresIn: getEnvVariable('JWT_EXPIRES_IN', '7d'),
  corsOrigin: getEnvVariable('CORS_ORIGIN', 'http://localhost:4200'),
};

// Validate critical configuration
if (config.jwtSecret === 'your-super-secret-jwt-key-change-this-in-production') {
  console.warn('WARNING: Using default JWT secret. Change this in production!');
}

export default config;
