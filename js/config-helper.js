"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const DEFAULTS = {
    MYSQLUSER: null,
    MYSQLPASS: null,
    MYSQLDBNAME: null,
    MYSQLHOST: null,
    MYSQLPORT: null,
    DB_ROOT_USER: null,
    DB_ROOT_PASS: null,
    BUCKET_NAME: null,
    S3_CONFIG: {},
};
let injectedConfig;
function injectConfig(config) {
    injectedConfig = Object.assign(Object.assign({}, DEFAULTS), config);
}
exports.injectConfig = injectConfig;
let loadedConfig;
function getConfig() {
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
    }
    catch (err) {
        console.error(err, 'could not load config.json, using defaults');
    }
    loadedConfig = Object.assign(Object.assign({}, DEFAULTS), config);
    return loadedConfig;
}
exports.getConfig = getConfig;
