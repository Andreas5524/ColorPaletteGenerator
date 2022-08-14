const colorContainers = document.getElementsByClassName("color-container");
const colors = document.getElementsByClassName("color");
const copyColorButtons = Array.from(document.getElementsByClassName("copy-color-button"));
const previousPaletteButton = document.getElementById("previous-palette-button");
const addColorButton = document.getElementById("add-color-button");
const removeColorButton = document.getElementById("remove-color-button");

previousPaletteButton.addEventListener("click", previousPalette);
document.getElementById("randomize-button").addEventListener("click", newColors);
addColorButton.addEventListener("click", addColor);
removeColorButton.addEventListener("click", removeColor);
document.getElementById("download-palette-button").addEventListener("click", downloadPalette);

for (let i = 0; i < copyColorButtons.length; i++)
    copyColorButtons[i].addEventListener("click", function () { copyColor(copyColorButtons.indexOf(this)) });

window.addEventListener("hashchange", setPaletteFromURL);

const yellowHue = 65;

const minNumberOfColors = 2;
const maxNumberOfColors = 8;
const defaultNumberOfColors = 4;

const minHueRange = 20;
const maxHueRange = 160;

const defaultColor = {
    hue: 209,
    saturation: 2,
    lightness: 18
}

const palette = {
    firstColor: copyObject(defaultColor),
    lastColor: copyObject(defaultColor),
    numberOfColors: defaultNumberOfColors
};

const paletteStringHistory = [];

function previousPalette() {
    let previousPaletteString = paletteStringHistory.pop();
    previousPaletteString = previousPaletteString.substring(0, previousPaletteString.length - 1);
    previousPaletteString += palette.numberOfColors;
    updateURL(previousPaletteString);
    if (paletteStringHistory.length == 0)
        previousPaletteButton.disabled = true;
}

function newColors() {
    paletteStringHistory.push(paletteStringBase10());
    previousPaletteButton.disabled = false;

    let firstHue = randomInt(0, 360);
    let secondHue;
    let hueRange = randomInt(minHueRange, maxHueRange);
    if (distanceHueBackward(firstHue, yellowHue) < distanceHueForward(firstHue, yellowHue))
        secondHue = firstHue + hueRange;
    else
        secondHue = firstHue - hueRange;
    secondHue = hue360Range(secondHue);
  
    palette.firstColor.hue = firstHue;
    palette.lastColor.hue = secondHue;

    let relativeLightness = Math.random();

    palette.firstColor.lightness = Math.round(relativeLightness * 30) + 65;
    palette.lastColor.lightness = randomInt(20, palette.firstColor.lightness - 40);

    palette.firstColor.saturation = randomInt(40, lerp(60, 80, relativeLightness));
    palette.lastColor.saturation = randomInt(5, palette.firstColor.saturation - 35);

    updateURL();
}

function setPaletteFromURL() {
    let fragment = window.location.href.split('#')[1];
    if (fragment != undefined && fragment.length >= 10) {
        let fragmentBase10 = parseInt(fragment, 32).toString().padStart(15, '0');
        palette.firstColor.hue = parseInt(fragmentBase10.substring(0, 3));
        palette.firstColor.saturation = parseInt(fragmentBase10.substring(3, 5));
        palette.firstColor.lightness = parseInt(fragmentBase10.substring(5, 7));
        palette.lastColor.hue = parseInt(fragmentBase10.substring(7, 10));
        palette.lastColor.saturation = parseInt(fragmentBase10.substring(10, 12));
        palette.lastColor.lightness = parseInt(fragmentBase10.substring(12, 14));
        palette.numberOfColors = parseInt(fragmentBase10.substring(14, 15));
    }
    else {
        palette.firstColor = copyObject(defaultColor);
        palette.lastColor = copyObject(defaultColor);
        palette.numberOfColors = defaultNumberOfColors;
    }
    updateColors();
    let defaultColorJSON = JSON.stringify(defaultColor);
    if (JSON.stringify(palette.firstColor) === defaultColorJSON && JSON.stringify(palette.lastColor) === defaultColorJSON)
        updateIcon(true);
    else
        updateIcon(false);
}

function copyObject(object) {
    return JSON.parse(JSON.stringify(object));
}

function addColor() {
    palette.numberOfColors++;
    removeColorButton.disabled = false;
    if (palette.numberOfColors === maxNumberOfColors)
        addColorButton.disabled = true;
    updateURL();
}

function removeColor() {
    palette.numberOfColors--;
    addColorButton.disabled = false;
    if (palette.numberOfColors === minNumberOfColors)
        removeColorButton.disabled = true;
    updateURL();
}

function updateURL(paletteString = null) {
    if (paletteString == null)
        paletteString = paletteStringBase10();
    let fragmentBase32 = parseInt(paletteString).toString(32);
    let urlSplit = location.href.split('#');
    location.href = urlSplit[0] + '#' + fragmentBase32.padStart(10, '0');
}

function paletteStringBase10() {
    let result = palette.firstColor.hue.toString().padStart(3, '0');
    result += palette.firstColor.saturation.toString().padStart(2, '0');
    result += palette.firstColor.lightness.toString().padStart(2, '0');
    result += palette.lastColor.hue.toString().padStart(3, '0');
    result += palette.lastColor.saturation.toString().padStart(2, '0');
    result += palette.lastColor.lightness.toString().padStart(2, '0');
    result += palette.numberOfColors;
    return result;
}

function updateColors() {
    for (let i = 0; i < colors.length; i++)
        colorContainers[i].style.display = i < palette.numberOfColors ? "flex" : "none";

    for (let i = 0; i < palette.numberOfColors; i++)
        colors[i].style.backgroundColor = getColor(i);
}

function copyColor(index) {
    navigator.clipboard.writeText(hexColor(getColor(index)));
}

function hexColor(color) {
    let canvasContext = document.createElement("canvas").getContext("2d");
    canvasContext.strokeStyle = color;
    return canvasContext.strokeStyle;
}

function getColor(index) {
    let lerpBy = index / (palette.numberOfColors - 1);
    let hue = lerpHue(palette.firstColor.hue, palette.lastColor.hue, lerpBy);
    let saturation = lerp(palette.firstColor.saturation, palette.lastColor.saturation, lerpBy);
    let lightness = lerp(palette.firstColor.lightness, palette.lastColor.lightness, lerpBy);
    return "hsl(" + hue + ", " + saturation + "%, " + lightness + "%)";
}

function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

function lerp(first, second, by) {
    return first * (1 - by) + second * by;
}

function lerpHue(first, second, by) {
    if (distanceHueBackward(first, second) < distanceHueForward(first, second))
        return hue360Range(first - (distanceHueBackward(first, second) * by));
    return hue360Range(first + (distanceHueForward(first, second) * by));
}

function distanceHue(first, second) {
    return Math.min(distanceHueForward(first, second), distanceHueBackward(first, second));
}

function distanceHueForward(first, second) {
    if (first > second)
        second += 360;
    return Math.abs(second - first);
}

function distanceHueBackward(first, second) {
    if (second > first)
        first += 360;
    return Math.abs(first - second);
}

function hue360Range(hue) {
    let i = hue
    while (hue < 0)
        hue += 360;
    return hue % 360;
}

function updateIcon(useDefaultIcon) {
    let link = document.querySelector("link[rel*='icon']");
    if (useDefaultIcon)
        link.href = "icon192.png";
    else {
        let canvas = document.createElement("canvas");
        let context = canvas.getContext("2d");
        canvas.width = 192;
        canvas.height = 192;
        const borderRadius = 24;
    
        for (let i = 0; i < palette.numberOfColors; i++) {
            context.fillStyle = colors[i].style.backgroundColor;
            context.fillRect(i / palette.numberOfColors * canvas.width, 0, canvas.width / palette.numberOfColors, canvas.height);
        }
    
        context.globalCompositeOperation = "destination-out";
        drawInsideCorner(context, 0, 0, borderRadius, 2);
        drawInsideCorner(context, canvas.width - borderRadius, 0, borderRadius, 3);
        drawInsideCorner(context, 0, canvas.height - borderRadius, borderRadius, 1);
        drawInsideCorner(context, canvas.width - borderRadius, canvas.height - borderRadius, borderRadius, 0);
        context.globalCompositeOperation = "source-over";
        
        link.href = canvas.toDataURL("image/png;base64");
    }
}

function drawInsideCorner(canvasContext, x, y, size, rotation) {
    canvasContext.beginPath();
    switch (rotation) {
        case 0:
            canvasContext.moveTo(x + size, y);
            canvasContext.lineTo(x + size, y + size);
            canvasContext.lineTo(x, y + size);
            canvasContext.arc(x, y, size, 0.5 * Math.PI, 0, true);
            break;
        case 1:
            canvasContext.moveTo(x + size, y + size);
            canvasContext.lineTo(x, y + size);
            canvasContext.lineTo(x, y);
            canvasContext.arc(x + size, y, size, Math.PI, 0.5 * Math.PI, true);
            break;
        case 2:
            canvasContext.moveTo(x, y + size);
            canvasContext.lineTo(x, y);
            canvasContext.lineTo(x + size, y);
            canvasContext.arc(x + size, y + size, size, 1.5 * Math.PI, Math.PI, true);
            break;
        case 3:
            canvasContext.moveTo(x, y);
            canvasContext.lineTo(x + size, y);
            canvasContext.lineTo(x + size, y + size);
            canvasContext.arc(x, y + size, size, 0, 1.5 * Math.PI, true);
            break;
    }
    canvasContext.fill();
}

function downloadPalette() {
    let canvas = document.createElement("canvas");
    canvas.width = palette.numberOfColors;
    canvas.height = 1;
    let context = canvas.getContext("2d");
    for (let i = 0; i < palette.numberOfColors; i++) {
        context.fillStyle = colors[i].style.backgroundColor;
        context.fillRect(i, 0, 1, 1);
    }
    download(canvas.toDataURL("image/png;base64"), "palette.png");
}

function download(url, fileName) {
    let link = document.createElement('a');
    link.download = fileName;
    link.href = url;
    link.click();
}

setPaletteFromURL();
if (palette.numberOfColors === maxNumberOfColors)
    addColorButton.disabled = true;
if (palette.numberOfColors === minNumberOfColors)
    removeColorButton.disabled = true;

navigator.serviceWorker.register("serviceWorker.js");