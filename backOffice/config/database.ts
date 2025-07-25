import path from 'path';  
import { parse } from "pg-connection-string";

export default ({ env }) => {
  const client = env('DATABASE_CLIENT', 'sqlite');

  const config = parse(process.env.DATABASE_URL || "");

  const connections = {
    postgres: {
      connection: {
        // connectionString: env('DATABASE_URL'),
        host: config.host,
        port: Number(config.port),
        database: config.database,
        user: config.user,
        password: config.password,
        ssl: env.bool('DATABASE_SSL', false) && {
          key: env('DATABASE_SSL_KEY', undefined),
          cert: env('DATABASE_SSL_CERT', undefined),
          ca: env('DATABASE_SSL_CA', undefined),
          capath: env('DATABASE_SSL_CAPATH', undefined),
          cipher: env('DATABASE_SSL_CIPHER', undefined),
          rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true),
        },
        schema: env('DATABASE_SCHEMA', 'public'),
      },
      pool: { min: env.int('DATABASE_POOL_MIN', 2), max: env.int('DATABASE_POOL_MAX', 10) },
    },
  };

  return {
    connection: {
      client,
      ...connections[client],
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    },
  };
};
