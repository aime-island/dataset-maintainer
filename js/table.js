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
/**
 * Base object for dealing with data in MySQL table.
 */
class Table {
    constructor(name, mysql) {
        this.name = name;
        this.mysql = mysql;
    }
    getName() {
        return this.name;
    }
    /**
     * Get the count of rows currently in this table.
     */
    getCount() {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows, fields] = yield this.mysql.query(`SELECT COUNT(*) AS count FROM ${this.getName()}`);
            return rows ? rows[0].count : 0;
        });
    }
    update(fields) {
        return __awaiter(this, void 0, void 0, function* () {
            const [columns, values] = Object.entries(fields).reduce(([columns, values], [column, value]) => [
                columns.concat(column),
                values.concat(typeof value == 'boolean' ? Number(value) : value),
            ], [[], []]);
            yield this.mysql.upsert(this.getName(), columns, values);
        });
    }
}
exports.default = Table;
