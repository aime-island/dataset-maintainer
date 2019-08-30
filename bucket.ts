import { S3, Request } from "aws-sdk";
import { AWS } from './aws';
import DB from "./db";
import { getConfig } from "./config-helper";

export default class Bucket {
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
          }).promise()
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

    async getAllValidClips(): Promise<{ id: number; glob: string; text: string; sound: S3.GetObjectOutput }[]> {
        const clips = await this.db.getAllValidClips();
        try {
          return await Promise.all(
            clips.map(async ({ id, path, sentence, sex, age, native_language }) => {
              const keyConfig = {
                Bucket: getConfig().BUCKET_NAME,
                Key: path,
              };
              let soundFile = null;
              await this.s3.getObject(keyConfig, (error, data) => {
                  if(error) {
                      console.log("ERROR GETTING OBJECT FROM S3 - " + path);
                  } 
                  else {
                    soundFile = data;
                  }
              }).promise()
              
              return {
                id,
                glob: path.replace('.mp3', ''),
                text: sentence,
                sound: soundFile,
                demogr: {
                    sex: sex,
                    age: age,
                    native_language: native_language
                }
              };
            })
          );
        } catch (e) {
          console.log('aws error', e, e.stack);
          return [];
        }
    }
}