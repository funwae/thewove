import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  database: {
    url: process.env.DATABASE_URL || 'postgresql://thewove:thewove_dev_password@localhost:5432/thewove',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'thewove',
    user: process.env.DB_USER || 'thewove',
    password: process.env.DB_PASSWORD || 'thewove_dev_password',
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },

  elasticsearch: {
    node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
  },

  s3: {
    endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
    accessKey: process.env.S3_ACCESS_KEY || 'thewove',
    secretKey: process.env.S3_SECRET_KEY || 'thewove_dev_password',
    bucket: process.env.S3_BUCKET || 'thewove-projects',
    region: process.env.S3_REGION || 'us-east-1',
  },

  auth: {
    auth0Domain: process.env.AUTH0_DOMAIN || '',
    auth0ClientId: process.env.AUTH0_CLIENT_ID || '',
    auth0ClientSecret: process.env.AUTH0_CLIENT_SECRET || '',
    auth0Audience: process.env.AUTH0_AUDIENCE || 'https://api.thewove.app',
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  ai: {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || '4096', 10),
    defaultModel: process.env.AI_DEFAULT_MODEL || 'claude-3-5-sonnet-20241022',
  },

  cloudflare: {
    apiToken: process.env.CLOUDFLARE_API_TOKEN || '',
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID || '',
    zoneId: process.env.CLOUDFLARE_ZONE_ID || '',
  },

  rateLimit: {
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    timeWindow: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  },

  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    prettyPrint: process.env.PRETTY_PRINT === 'true',
  },

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },

  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
    maxProjectSize: parseInt(process.env.MAX_PROJECT_SIZE || '104857600', 10), // 100MB
  },

  websocket: {
    heartbeatInterval: parseInt(process.env.WS_HEARTBEAT_INTERVAL || '30000', 10),
    timeout: parseInt(process.env.WS_TIMEOUT || '60000', 10),
  },

  queue: {
    concurrency: parseInt(process.env.QUEUE_CONCURRENCY || '5', 10),
    maxRetries: parseInt(process.env.QUEUE_MAX_RETRIES || '3', 10),
  },
};

export const isDevelopment = config.env === 'development';
export const isProduction = config.env === 'production';
export const isTest = config.env === 'test';
