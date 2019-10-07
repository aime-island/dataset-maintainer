"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_helper_1 = require("./config-helper");
const aws_sdk_1 = require("aws-sdk");
if (process.env.HTTP_PROXY) {
    const proxy = require('proxy-agent');
    aws_sdk_1.config.update({
        httpOptions: { agent: proxy(process.env.HTTP_PROXY) },
    });
}
var AWS;
(function (AWS) {
    let s3 = new aws_sdk_1.S3(config_helper_1.getConfig().S3_CONFIG);
    function getS3() {
        return s3;
    }
    AWS.getS3 = getS3;
})(AWS = exports.AWS || (exports.AWS = {}));
