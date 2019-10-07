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
const mysql_1 = require("./mysql");
const clip_table_1 = require("./clip-table");
const vote_table_1 = require("./vote-table");
class DB {
    constructor() {
        this.mysql = mysql_1.getMySQLInstance();
        this.clip = new clip_table_1.default(this.mysql);
        this.vote = new vote_table_1.default(this.mysql);
    }
    getAllValidClips() {
        return __awaiter(this, void 0, void 0, function* () {
            const [clips] = yield this.mysql.query(`
          SELECT *
          FROM (
            SELECT clips.*
            FROM clips
            LEFT JOIN sentences on clips.original_sentence_id = sentences.id
            WHERE is_valid IS true
          ) t
        `);
            for (const clip of clips) {
                clip.voters = clip.voters ? clip.voters.split(',') : [];
            }
            return clips;
        });
    }
}
exports.default = DB;
