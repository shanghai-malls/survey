import 'clientjs';

const client = new window.ClientJS();
const ua = client.getBrowserData().ua;
const canvasPrint = client.getCanvasPrint();

export let clientId = client.getFingerprint();
export let deviceId = client.getCustomFingerprint(ua, canvasPrint);



function getTenantId() {
    const hostname = window.location.hostname;
    // language=JSRegexp
    const re=/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;//正则表达式
    return re.test(hostname) ? "default" : hostname.substring(0, hostname.indexOf("."));
}

export let tenantId = getTenantId() || "default";