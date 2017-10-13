import {deviceId,clientId,tenantId} from './client';
import querystring from './query-string';


export class http {
    constructor(method,url){
        this.method = method;
        this.url = url;
        this.requestHeaders = {
            'Accept'    :'application/json',
            'Tenant-Id' : tenantId,
            'Device-Id' : deviceId,
            'User-Id'   : clientId
        };
    }

    header(key, value){
        this.requestHeaders[key] = value;
        return this;
    };

    headers(headers){
        this.requestHeaders = Object.assign(this.requestHeaders,headers);
        return this;
    }
    contentType(type){
        return this.header("Content-Type",type);
    }

    accept(type){
        return this.header("Accept",type);
    }

    body(data,contentType){
        if(!data){
            return this;
        }
        if(this.method === 'PUT' || this.method === 'POST') {


            if(contentType) {
                this.requestHeaders['Content-Type'] = contentType;
            } else {
                if(!this.requestHeaders['Content-Type']){
                    this.requestHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
                }
                contentType = this.requestHeaders['Content-Type'];
            }

            let encode;
            if(contentType === 'application/x-www-form-urlencoded'){
                encode = querystring.stringify;
            } else {
                encode = JSON.stringify;
            }
            if(typeof data === 'object'){
                data = encode(data)
            }
            this.requestBody = data;
        } else {
            if(typeof data === 'object') {
                data = querystring.stringify(data)
            }
            this.url = this.url + '?' + data;
        }
        return this;
    }
    then(callback){
        let request = new Request(this.url,{
            method : this.method,
            headers: this.requestHeaders,
            body: this.requestBody,
            credentials:'include'
        });
        let response;
        let transform = (resp)=>{
            response = resp;
            let accept = this.requestHeaders['Accept'];
            let contentType = response.headers.get('Content-Type');
            if((accept && accept.indexOf('json')!== -1) || (contentType && contentType.indexOf('json') !== -1)) {
                return response.json();
            }
            return response.text();
        };
        let callWithArguments = (data)=>{
            return callback.call(this,data,response);
        };

        return fetch(request).then(transform).then(callWithArguments);
    }
}

http.get = function(href){
    return new http('GET',href);
};
http.post = function(href){
    return new http('POST',href);
};
http.put = function(href){
    return new http('PUT',href);
};
http.delete = function(href){
    return new http('DELETE',href);
};

