import * as dotenv from 'dotenv';
dotenv.config();

export const SwaggerConfig = {
  title: process.env.OPENAPI_TITLE || 'ZexServer API',
  description: process.env.OPENAPI_DESCRIPTION || 'Auto generated OpenAPI docs',
  version: process.env.OPENAPI_VERSION || '1.0.0',
  basePath: process.env.OPENAPI_BASE_PATH || '/api/v1',
  servers: [{ url: process.env.OPENAPI_SERVER_URL || 'http://localhost:3000/api/v1' }],
};
