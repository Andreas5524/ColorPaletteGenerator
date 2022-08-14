const tooltipVisibleClass = "button-tooltip-visible";

const tooltips = document.getElementsByClassName("button-tooltip");
const tooltipTriangles = document.getElementsByClassName("button-tooltip-triangle");

for (let i = 0; i < tooltips.length; i++) {
    let parent = tooltips[i].parentElement;
    if (isTouchDevice()) {
        parent.addEventListener("touchstart", touchStart);
        parent.addEventListener("touchend", touchEnd);
    }
    else {
        parent.addEventListener("mouseover", function() { showTooltip(this); });
        parent.addEventListener("mouseout", function() { hideTooltip(this); });
        parent.addEventListener("focus", function() { showTooltip(this); });
        parent.addEventListener("blur", function() { hideTooltip(this); });
    }
}

let touchTimer;
function touchStart() {
    touchTimer = setTimeout(showTooltip, 500, this);
}

function touchEnd() {
    clearTimeout(touchTimer);
    hideTooltip(this);
}

function showTooltip(element) {
    hideAllTooltips();
    let tooltip =  element.firstElementChild;
    fixTooltipPosition(tooltip);
    tooltip.classList.add(tooltipVisibleClass);
    element.children[1].classList.add(tooltipVisibleClass);
}

function hideTooltip(element) {
    element.firstElementChild.classList.remove(tooltipVisibleClass);
    element.children[1].classList.remove(tooltipVisibleClass);
}

function hideAllTooltips() {
    for (let i = 0; i < tooltips.length; i++) {
        tooltips[i].classList.remove(tooltipVisibleClass);
        tooltipTriangles[i].classList.remove(tooltipVisibleClass);
    }
}

function fixTooltipPosition(tooltip) {
    let parentRect = tooltip.parentElement.getBoundingClientRect();
    tooltip.style.left = parentRect.width / 2 + "px";
    let tooltipRect = tooltip.getBoundingClientRect();
    let viewportWidth = document.documentElement.clientWidth;
    if (tooltipRect.left < 0)
        tooltip.style.left = parentRect.width / 2 - tooltipRect.left + "px";
    else if (viewportWidth - tooltipRect.right < 0)
        tooltip.style.left = parentRect.width / 2 + (viewportWidth - tooltipRect.right) + "px";
}

function isTouchDevice() {
    return "ontouchstart" in window;
}