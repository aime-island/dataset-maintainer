// import schedule from 'node-schedule';
const schedule = require('node-schedule');
const { getElapsedSeconds } = require('./utility');
import FileDownloader from './file-downloader';
const fs = require('fs');


export default class NodeApp {
    private fd: any;
    private clipsDir: string;
    private infoFile: string;

    constructor() {
        this.fd = new FileDownloader();
        this.clipsDir = "";
    }

    private print(...args: any[]): void {
        args.unshift('APPLICATION --');
        console.log.apply(console, args);
    }

    private getReccuranceRule(): any {
        // 04:30 every night
        var rule = new schedule.RecurrenceRule();
        // rule.hour = 4; 
        // rule.minute = 30;
        rule.second = 30;
        return rule;
    }

    private startSchedule(): void {
        var job = schedule.scheduleJob(this.getReccuranceRule(), () => { this.updateDataset(this.print); });
    }

    private async updateDataset(print: any) {
        const start = Date.now()
        const datestring = start.toString();

        print('Maintenance task starting at ' + new Date() + '...');
        try {
            print('Updating dataset');
            fs.mkdirSync(datestring);
            await this.fd.getAllValidClips(datestring + '/clips', datestring + '/README.txt');
            print(`Task complete. Took ${getElapsedSeconds(start)}s to perform maintenance task.`)
        } catch(err) {
            print('Maintenance error ', err);
        }

    }

     run(): void {
        this.print('Starting Samromur Dataset Maintainer app...');
        this.startSchedule();
        // this.updateDataset(this.print);
    }  
}

if (require.main === module) {
    let app = new NodeApp();
    app.run();
}