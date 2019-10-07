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
// import schedule from 'node-schedule';
const schedule = require('node-schedule');
const { getElapsedSeconds } = require('./utility');
const file_downloader_1 = require("./file-downloader");
const fs = require('fs');
class NodeApp {
    constructor() {
        this.fd = new file_downloader_1.default();
        this.clipsDir = "";
    }
    print(...args) {
        args.unshift('APPLICATION --');
        console.log.apply(console, args);
    }
    getReccuranceRule() {
        // 04:30 every night
        var rule = new schedule.RecurrenceRule();
        // rule.hour = 4; 
        // rule.minute = 30;
        rule.second = 30;
        return rule;
    }
    startSchedule() {
        var job = schedule.scheduleJob(this.getReccuranceRule(), () => { this.updateDataset(this.print); });
    }
    updateDataset(print) {
        return __awaiter(this, void 0, void 0, function* () {
            const start = Date.now();
            const datestring = start.toString();
            print('Maintenance task starting at ' + new Date() + '...');
            try {
                print('Updating dataset');
                fs.mkdirSync(datestring);
                yield this.fd.getAllValidClips(datestring + '/clips', datestring + '/README.txt');
                print(`Task complete. Took ${getElapsedSeconds(start)}s to perform maintenance task.`);
            }
            catch (err) {
                print('Maintenance error ', err);
            }
        });
    }
    run() {
        this.print('Starting Samromur Dataset Maintainer app...');
        this.startSchedule();
        // this.updateDataset(this.print);
    }
}
exports.default = NodeApp;
if (require.main === module) {
    let app = new NodeApp();
    app.run();
}
