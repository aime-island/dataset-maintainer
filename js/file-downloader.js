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
const aws_1 = require("./aws");
const db_1 = require("./db");
const config_helper_1 = require("./config-helper");
const readline = require("readline");
const mkdirp = require('mkdirp-promise');
const fs = require('fs');
class FileDownloader {
    constructor() {
        this.db = new db_1.default();
        this.s3 = aws_1.AWS.getS3();
    }
    getAllValidClips(clipDirLoc, infoFileLoc) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const clips = yield this.db.getAllValidClips();
                if (!fs.existsSync(clipDirLoc)) {
                    fs.mkdir(clipDirLoc, { recursive: true }, (err) => {
                        if (err)
                            throw err;
                    });
                }
                if (!fs.existsSync(infoFileLoc)) {
                    fs.writeFile(infoFileLoc, "path,sentance,sex,age,native_language\n", (err) => {
                        if (err)
                            throw err;
                    });
                }
                const clipsSize = clips.length;
                let clipsNumber = 1;
                clips.forEach(({ id, path, sentence, sex, age, native_language }) => __awaiter(this, void 0, void 0, function* () {
                    const keyConfig = {
                        Bucket: config_helper_1.getConfig().BUCKET_NAME,
                        Key: path,
                    };
                    if (clipDirLoc[clipDirLoc.length - 1] != '/') {
                        clipDirLoc = clipDirLoc + '/';
                    }
                    if (infoFileLoc[infoFileLoc.length - 1] != '/') {
                        infoFileLoc = infoFileLoc + '/';
                    }
                    const clipInfo = path + '\t' + sentence + '\t' + sex + '\t' + age + '\t' + native_language;
                    const filePath = path.slice(0, path.lastIndexOf('/'));
                    yield mkdirp(clipDirLoc + filePath).catch(() => {
                        console.log("error");
                    });
                    const fileStream = fs.createWriteStream(clipDirLoc + path);
                    this.s3.getObject(keyConfig).createReadStream().pipe(fileStream);
                    fs.appendFileSync(infoFileLoc, clipInfo + '\n');
                    this.printProgress(clipsNumber, clipsSize);
                    clipsNumber++;
                }));
            }
            catch (e) {
                console.log('Error downloading files: ', e, e.stack);
            }
        });
    }
    printProgress(i, max) {
        readline.clearLine(process.stdout, 0);
        readline.cursorTo(process.stdout, 0, null);
        process.stdout.write('### ' + i + ' / ' + max + ' ###');
        if (i == max) {
            process.stdout.write('\n');
        }
    }
}
exports.default = FileDownloader;
