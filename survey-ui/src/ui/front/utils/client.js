import 'clientjs';

let client = new window.ClientJS();
let ua = client.getBrowserData().ua;
let canvasPrint = client.getCanvasPrint();

export let clientId = client.getFingerprint();
export let deviceId = client.getCustomFingerprint(ua, canvasPrint);

let hostname = window.location.hostname;
let tenantId = "default";
if(hostname.indexOf(".") !== -1) {
    // tenantId = hostname.substring(0,hostname.indexOf("."));
}
export {tenantId};