import * as fs from 'fs';
import { S3 } from 'aws-sdk';

export type SamromurConfig = {
  MYSQLUSER: string;
  MYSQLPASS: string;
  MYSQLDBNAME: string;
  MYSQLHOST: string;
  MYSQLPORT: number;
  DB_ROOT_USER: string;
  DB_ROOT_PASS: string;
  BUCKET_NAME: string;
  S3_CONFIG: S3.Types.ClientConfiguration;
};

const DEFAULTS: SamromurConfig = {
  MYSQLUSER: null, // Hidden
  MYSQLPASS: null, // Hidden
  MYSQLDBNAME: null, // Hidden
  MYSQLHOST: null, // Hidden
  MYSQLPORT: null, // Hidden
  DB_ROOT_USER: null, // Hidden
  DB_ROOT_PASS: null, // Hidden
  BUCKET_NAME: null, // Hidden
  S3_CONFIG: {}, // Hidden
};

let injectedConfig: SamromurConfig;

export function injectConfig(config: any) {
  injectedConfig = { ...DEFAULTS, ...config };
}

let loadedConfig: SamromurConfig;

export function getConfig(): SamromurConfig {
  if (injectedConfig) {
    return injectedConfig;
  }

  if (loadedConfig) {
    return loadedConfig;
  }

  let config = null;
  try {
    let config_path = process.env.SERVER_CONFIG_PATH || './config.json';
    config = JSON.parse(fs.readFileSync(config_path, 'utf-8'));
  } catch (err) {
    console.error(err, 'could not load config.json, using defaults');
  }
  loadedConfig = { ...DEFAULTS, ...config };

  return loadedConfig;
}
