const http = require('http');
const {URL} = require('url');
const querystring = require('querystring');

let NativeRequestBuilder = function () {
    this.options = {};
};

NativeRequestBuilder.get = function(href){
    return NativeRequestBuilder.request('DELETE',href);
};
NativeRequestBuilder.post = function(href){
    return NativeRequestBuilder.request('DELETE',href);
};
NativeRequestBuilder.put = function(href){
    return NativeRequestBuilder.request('DELETE',href);
};
NativeRequestBuilder.delete = function(href){
    return NativeRequestBuilder.request('DELETE',href);
};
NativeRequestBuilder.request = function(method,href){
    let url = new URL(href);
    this.options.hostname = url.hostname;
    this.options.port = url.port;

    let path = url.pathname;
    if(url.hash) {
        path += url.hash
    } else if(url.search) {
        path += url.search
    }

    let builder = new NativeRequestBuilder();
    builder.href = href;
    builder.options.method = method;
    builder.options.path = path;
    return builder;
};
NativeRequestBuilder.prototype.contentType = function (type) {
    return this.header('Content-Type',type);
};
NativeRequestBuilder.prototype.accept = function (type) {
    return this.header('Accept',type);
};
NativeRequestBuilder.prototype.header = function(key,value){
    this.options.headers = this.options.headers || {};
    this.options.headers[key] = value;
    return this;
};
NativeRequestBuilder.prototype.body = function (body) {
    let method = this.options.method;
    if(method === 'PUT' || method === 'POST') {
        let contentType = this.options.headers['Content-Type'] || 'application/x-www-form-urlencoded';
        let proc = JSON;
        if(contentType === 'application/x-www-form-urlencoded'){
            proc = querystring;
        }
        if(typeof body === 'object'){
            body = proc.stringify(body)
        }
        this.body = body;
        this.options.headers['Content-Length'] = Buffer.byteLength(body);
    }
    return this;
};

NativeRequestBuilder.prototype.execute = function (callback) {
    let nativeRequest = http.request(this.options,(resp)=>{
        let data = '';
        resp.on('data', (chunk) =>{
            data += chunk;
        });
        resp.on('end', () => {
            if(this.options.headers['Accept'].indexOf('json') !== -1
                || resp.headers['content-type'].indexOf('json') !== -1) {
                data = JSON.parse(data);
            }
            callback(null, resp, data);
        });
    });
    nativeRequest.on('error',(error)=>{
        console.log(`请求失败，url=>${this.href}，body=>${JSON.stringify(this.body,null,2)}`,JSON.stringify(error,null,2));
        callback(error);
    });

    if(this.body) {
        nativeRequest.write(this.body);
    }
    nativeRequest.end();
};

module.exports = NativeRequestBuilder;