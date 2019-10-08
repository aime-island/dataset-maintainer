import { S3 } from "aws-sdk";
import { AWS } from './aws';
import DB from "./db";
import { getConfig } from "./config-helper";
import * as readline from 'readline'
const mkdirp = require('mkdirp-promise');
const fs = require('fs');

export default class FileDownloader {
    private db: DB;
    private s3: S3;
  
    constructor() {
        this.db = new DB();
        this.s3 = AWS.getS3();
    }

    public async getAllValidClips(clipDirLoc: string, infoFileLoc: string): Promise<void> {
      try {
          const clips = await this.db.getAllValidClips(); 
          if(!fs.existsSync(clipDirLoc)) {
            fs.mkdir(clipDirLoc, { recursive: true }, (err) => {
              if (err)
                throw err;
            });
          }
          if(!fs.existsSync(infoFileLoc)) {
            fs.writeFile(infoFileLoc, "path,sentance,sex,age,native_language\n", (err) => {
              if(err) throw err;
            });
          }
          const clipsSize = clips.length;
          let clipsNumber = 1;
          clips.forEach(async ({ path, sentence, sex, age, native_language }) => {
            const keyConfig = {
              Bucket: getConfig().BUCKET_NAME,
              Key: path,
            };
            
            if(clipDirLoc[clipDirLoc.length - 1] != '/') { 
              clipDirLoc = clipDirLoc + '/'; 
            }
            if(infoFileLoc[infoFileLoc.length - 1] != '/') { 
              infoFileLoc = infoFileLoc + '/'; 
            }
            const clipInfo = path + '\t' + sentence + '\t' + sex + '\t' + age + '\t' + native_language;
            const filePath = path.slice(0, path.lastIndexOf('/'));
            await mkdirp(clipDirLoc + filePath).catch(() => {
              console.log("error")
            });
            const fileStream = fs.createWriteStream(clipDirLoc + path);
            this.s3.getObject(keyConfig).createReadStream().pipe(fileStream);
            fs.appendFileSync(infoFileLoc, clipInfo + '\n');
            this.printProgress(clipsNumber, clipsSize);
            clipsNumber++;
          });
        } catch (e) {
          console.log('Error downloading files: ', e, e.stack);
        }
    }

    private printProgress(i: number, max: number): void {
      readline.clearLine(process.stdout, 0);
      readline.cursorTo(process.stdout, 0, null);
      process.stdout.write('### ' + i + ' / ' + max + ' ###');
      if(i == max) {
        process.stdout.write('\n');
      }
    }
}