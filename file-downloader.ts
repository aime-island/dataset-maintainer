import { S3, Request } from "aws-sdk";
import fs from 'fs';
import { AWS } from './aws';
import DB from "./db";
import { getConfig } from "./config-helper";
import * as readline from 'readline'

export default class FileDownloader {
    private db: DB;
    private s3: S3;
  
    constructor() {
        this.db = new DB();
        this.s3 = AWS.getS3();
    }

    private async getObject(path: string): Promise<S3.GetObjectOutput> {
        const keyConfig = {
            Bucket: getConfig().BUCKET_NAME,
            Key: path,
          };
          let soundFile = null;
          await this.s3.getObject(keyConfig, (error, data) => {
              if(error) {
                  console.log('aws getObject error ' + path , error);
              } 
              else {
                soundFile = data;
              }
          });
          return soundFile;
    }

    async getClip(path: string): Promise<S3.GetObjectOutput> {
        try {
          return await this.getObject(path);
        } catch (e) {
          console.log('aws error', e, e.stack);
          return null;
        }
    }

    async getAllValidClips(clipDirLoc: string, infoFileLoc: string) {
      try {
          const clips = await this.db.getAllValidClips(); 
          if(!fs.existsSync(clipDirLoc)) {
            fs.mkdir(clipDirLoc, { recursive: true }, (err) => {
              if (err)
                throw err;
            });
          }
          if(!fs.existsSync(infoFileLoc)) {
            fs.writeFile(infoFileLoc, "path,sentance,sex,age,native_language", (err) => {
              if(err) throw err;
            });
          }
          const clipsSize = clips.length;
          let clipsIndex = 0
          clips.forEach(async ({ id, path, sentence, sex, age, native_language }) => {
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
            
            const fileStream = fs.createWriteStream(clipDirLoc);
            await this.s3.getObject(keyConfig).createReadStream().pipe(fileStream);
            fs.appendFileSync(infoFileLoc, clipInfo);
            this.printProgress(clipsIndex, clipsSize);
            clipsIndex++;
          });
        } catch (e) {
          console.log('Error downloading files: ', e, e.stack);
        }
    }

    printProgress(i: number, max: number): void {
      readline.clearLine(process.stdout, 0);
      readline.cursorTo(process.stdout, 0, null);
      process.stdout.write(i + '/' + max);
    }
}