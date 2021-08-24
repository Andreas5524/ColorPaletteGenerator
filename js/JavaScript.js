window.clipboard = {
    copyText: function (text) {
        navigator.clipboard.writeText(text)
        clipboardChanged();
    }
}

document.oncopy = clipboardChanged;
window.onfocus = windowFocus;

function clipboardChanged() {
    DotNet.invokeMethodAsync("ColorPaletteGenerator", "InvokeOnClipboardChanged");
}

function windowFocus() {
    DotNet.invokeMethodAsync("ColorPaletteGenerator", "InvokeOnWindowFocus");
}