"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_helper_1 = require("./config-helper");
const utility_1 = require("./utility");
const SALT = 'hoads8fh49hgfls';
// Mysql2 has more or less the same interface as @types/mysql,
// so we will use mysql types here where we can.
const mysql2 = require('mysql2/promise');
// Default configuration values, notice we dont have password.
const DEFAULTS = {
    user: 'voiceweb',
    database: 'voiceweb',
    password: '',
    host: 'localhost',
    port: 3306,
    connectTimeout: 30000,
    multipleStatements: false,
    namedPlaceholders: true,
};
class Mysql {
    constructor() {
        this.rootConn = null;
    }
    /**
     * Get options from params first, then config, and falling back to defaults.
     *   For configuring, use the following order of priority:
     *     1. options in config.json
     *     2. hard coded DEFAULTS
     */
    getMysqlOptions() {
        const config = config_helper_1.getConfig();
        return {
            user: utility_1.getFirstDefined(config.MYSQLUSER, DEFAULTS.user),
            database: utility_1.getFirstDefined(config.MYSQLDBNAME, DEFAULTS.database),
            password: utility_1.getFirstDefined(config.MYSQLPASS, DEFAULTS.password),
            host: utility_1.getFirstDefined(config.MYSQLHOST, DEFAULTS.host),
            port: utility_1.getFirstDefined(config.MYSQLPORT, DEFAULTS.port),
            connectTimeout: DEFAULTS.connectTimeout,
            multipleStatements: false,
            namedPlaceholders: true,
        };
    }
    getConnection(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return mysql2.createConnection(options);
        });
    }
    createPool() {
        return __awaiter(this, void 0, void 0, function* () {
            return mysql2.createPool(this.getMysqlOptions());
        });
    }
    getPool() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.pool)
                return this.pool;
            return (this.poolPromise ||
                (this.poolPromise = new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                    this.pool = yield this.createPool();
                    resolve(this.pool);
                }))));
        });
    }
    query(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.getPool()).query(...args);
        });
    }
    escape(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.getPool()).escape(...args);
        });
    }
    ensureRootConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if we already have the connection we want.
            if (this.rootConn) {
                return;
            }
            // Copy our pre-installed configuration.
            const opts = Object.assign({}, this.getMysqlOptions());
            // Do not specify the database name when connecting.
            delete opts.database;
            // Root gets an upgraded connection optimized for schema migration.
            const config = config_helper_1.getConfig();
            opts.user = config.DB_ROOT_USER;
            opts.password = config.DB_ROOT_PASS;
            opts.multipleStatements = true;
            const conn = yield this.getConnection(opts);
            conn.on('error', this.handleError.bind(this));
            this.rootConn = conn;
        });
    }
    handleError(err) {
        console.error('unhandled mysql error', err.message);
    }
    /**
     * Insert or update query generator.
     */
    upsert(tableName, columns, values) {
        return __awaiter(this, void 0, void 0, function* () {
            // Generate our bounded parameters.
            const params = values.map((val) => {
                return '?';
            });
            const dupeSql = columns.map((column) => {
                return `${column} = ?`;
            });
            // We are using the same values twice in the query.
            const allValues = values.concat(values);
            yield this.query(`INSERT INTO ${tableName} (${columns.join(',')})
       VALUES (${params.join(',')})
       ON DUPLICATE KEY UPDATE ${dupeSql.join(',')};`, allValues);
        });
    }
    getProcedureName(body) {
        return 'F_' + utility_1.hash(body, SALT);
    }
    /**
     * Call a stored procedure by procedure name generated in getProcedureName.
     */
    callProc(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.rootConn.query(`CALL \`${name}\``);
        });
    }
    /**
     * Create and execute a stored procedure as root.
     */
    rootTransaction(body) {
        return __awaiter(this, void 0, void 0, function* () {
            // Hash proc body to get a unique proc name.
            // This makes sure we have a unique name for each proc operation.
            const name = this.getProcedureName(body);
            const transactionQuery = `
      CREATE PROCEDURE \`${name}\`()
      BEGIN
          DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
          BEGIN
            ROLLBACK;
            RESIGNAL;
          END;
          START TRANSACTION;
          ${body}
          COMMIT;
      END;`;
            // Ensure root.
            yield this.ensureRootConnection();
            // Here we'll try to create the proc, but if the proc name
            // already exists we can be sure it's the same operation
            // so we will trap the error and call the pre-defined proc.
            try {
                yield this.rootConn.query(transactionQuery);
            }
            catch (err) {
                // If proc already exists, we are good to go.
                if (err.code !== 'ER_SP_ALREADY_EXISTS') {
                    throw err;
                }
            }
            // Attempting to call proc.
            yield this.callProc(name);
        });
    }
    /**
     * Execute a prepared statement on the root connection.
     */
    rootExec(sql, values) {
        return __awaiter(this, void 0, void 0, function* () {
            values = values || [];
            yield this.ensureRootConnection();
            return this.rootConn.execute(sql, values);
        });
    }
    /**
     * Execute a regular query on the root connection.
     */
    rootQuery(sql) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureRootConnection();
            return this.rootConn.query(sql);
        });
    }
    /**
     * Close all connections to the database.
     */
    endConnection() {
        console.log(this.pool.end);
        if (this.pool) {
            this.pool.end().catch((e) => console.error(e));
            this.pool = null;
        }
        if (this.rootConn) {
            this.rootConn.destroy();
            this.rootConn = null;
        }
    }
}
exports.default = Mysql;
let instance;
function getMySQLInstance() {
    return instance || (instance = new Mysql());
}
exports.getMySQLInstance = getMySQLInstance;
