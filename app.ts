import { S3 } from 'aws-sdk';
import { AWS } from './aws';
import { RecurrenceRule, scheduleJob }  from 'node-schedule'
import { getElapsedSeconds } from './utility';

export default class NodeApp {
    private s3: S3;

    constructor() {
        this.s3 = AWS.getS3();
    }

    private print(...args: any[]): void {
        args.unshift('APPLICATION --');
        console.log.apply(console, args);
    }

    private getReccuranceRule(): RecurrenceRule {
        // 04:30 every night
        var rule = new RecurrenceRule();
        rule.hour = 4; 
        rule.minute = 30;

        return rule;
    }

    private startSchedule(): void {
        var job = scheduleJob(this.getReccuranceRule(), this.updateDataset.bind(this));
    }

    private updateDataset(print: any): void {
        const start = Date.now();
        print('Maintenance task starting...');
        
        try {
            print('Updating dataset');

        } catch(err) {
            print('Maintenance error ', err);
        } finally {
            print(`Task complete. Took ${getElapsedSeconds(start)}s to perform maintenance task.`)
        }

        // TODO: Update old dataset
    }

     run(): void {
        this.print('Starting Samromur Dataset Maintainer app...');
        this.startSchedule();
    }  
}

if (require.main === module) {
    let app = new NodeApp();
    app.run();
}