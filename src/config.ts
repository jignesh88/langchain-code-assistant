import dotenv from 'dotenv';
import path from 'path';

// Load environment-specific .env file
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: envFile });

export const config = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    baseUrl: process.env.OPENAI_API_BASE_URL || 'https://api.openai.com/v1',
    modelName: 'gpt-4-turbo-preview' // or your preferred model
  },
  application: {
    codeDirectory: process.env.CODE_DIRECTORY || path.join(process.cwd(), 'code-to-analyze'),
    chromaDirectory: process.env.CHROMA_DIRECTORY || path.join(process.cwd(), 'chroma-db'),
    port: parseInt(process.env.PORT || '3000', 10)
  },
  environment: process.env.NODE_ENV || 'development',
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'app.log'
  },
  security: {
    sessionSecret: process.env.SESSION_SECRET || 'default-secret-change-in-production',
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000']
  }
};

// Validate config
if (!config.openai.apiKey) {
  throw new Error('OPENAI_API_KEY is required');
}