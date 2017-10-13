function resize() {
    let designWidth = 750;
    let widths = document.documentElement.clientWidth;
    document.documentElement.style.fontSize = widths / designWidth * 100 + "px";
}
resize();
window.onresize = resize;

