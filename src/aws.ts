import { getConfig } from './config-helper';
import { config, S3 } from 'aws-sdk';

if (process.env.HTTP_PROXY) {
  const proxy = require('proxy-agent');

  config.update({
    httpOptions: { agent: proxy(process.env.HTTP_PROXY) },
  });
}

export namespace AWS {
  let s3 = new S3(getConfig().S3_CONFIG);

  export function getS3() {
    return s3;
  }
}
