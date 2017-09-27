let baseURI = 'http://10.38.168.98:50000';
let aliyunOssOptions = {
    region: 'oss-cn-hangzhou',
    bucket: 'jikezhiji',
    accessKeyId: 'LTAIltuonpeFO33K',
    accessKeySecret: 'yxWBJ3Cw6E6R0Krxk6qvzzoqq2bTON',
};
let sessionIdSecret = 'session-id-secret';

function getRequestHeaders(req){
    let headers = {};
    let rawHeaders = req.rawHeaders;
    for(let i = 0; i < rawHeaders.length; i++){
        headers[rawHeaders[i]] = rawHeaders[++i];
    }
    return headers;
}

const NativeRequestBuilder = require('./native-request-builder');

module.exports = {
    baseURI,
    getRequestHeaders,
    NativeRequestBuilder,
    sessionIdSecret,
    aliyunOssOptions
};