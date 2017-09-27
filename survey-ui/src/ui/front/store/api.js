
export const API_PREFIX = '/api';



export function normalize(path) {
    return path.replace(/\/\//g,'/');
}

export function unwrappedEmbedded(resp){
    let data = resp._embedded;
    if(data) {
        delete resp._embedded;
        return Object.assign(data,resp);
    }
    return resp;
}