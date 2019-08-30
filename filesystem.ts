import * as fs from 'fs';
const path = 'dataset';

export default class filesystem {

    async createDir(): Promise<any> {
        fs.promises.mkdir(path)
            .catch( e => {
                
            })
            .then( r => {

            });
    }

    async writeFile(file: any): Promise<any> {

    }
}