// should've built a game class but whatever
const DIM = 32;
const BSIZE = 3;
const REALDIM = DIM + BSIZE;
const DEFAULT_COLORS = ["", "#000", "#FFF", "#F00", "#0F0", "#00F", "#FF0", "#F0F", "#0FF"];

let readCopyCode = false;
let pixels = new Array(REALDIM * REALDIM);
let pcard = new Array(DIM);

// gx,gy = game x,y (the active pixel cordinates)
let gx = 0;
let gy = 30;
let c = "";
let actions = [];


class Pixel {
    constructor(color, isBorder, isPallete, isActive, isBlocked) {
        this.color = color;
        this.isBorder = isBorder;
        this.isActive = isActive;
        this.isPallete = isPallete;
        this.isBlocked = isBlocked;
    }
}

class PCardSlot {
    constructor(isHole, clickable) {
        this.isHole = isHole;
        this.clickable = clickable;
    }
}

function v_updateActions() {
    let $historyDiv = document.querySelector('#history');
    $historyDiv.innerHTML = actions.join("");
    $historyDiv.scrollTop = $historyDiv.scrollHeight;
}

function toggleCol(colI) {
    for (let i = 0; i < REALDIM; i++) {
        let pi = colI + i * REALDIM;
        pixels[pi].isBlocked = !pixels[pi].isBlocked;
        v_updatePixel(pi);
    }
}

function togglePCardHole(ci) {
    pcard[ci].isHole = !pcard[ci].isHole;
    v_updatePCard();

    toggleCol(ci);
}

function v_updatePCard() {
    let $pcard = document.querySelector('#pcard');

    $pcard.replaceChildren();
    $pcard.style.width = REALDIM + "vw";

    for (var i = 0; i < REALDIM; i++) {
        let p = pcard[i];
        let newPElm = document.createElement('pixel');

        if (p.isHole) {
            newPElm.classList.add('isHole');
        }

        if (p.clickable) {
            newPElm.classList.add('clickable');
        }

        let ci = i;
        newPElm.addEventListener('click', function () {
            togglePCardHole(ci);
        });

        $pcard.appendChild(newPElm);
    }
}

function v_updatePixel(pi) {
    let $pixels = document.querySelectorAll('#pixels pixel');
    let $pixel = $pixels[pi];
    let p = pixels[pi];

    if (p.isBorder) {
        $pixel.classList.add('border');
    } else {
        $pixel.classList.remove('border');
    }

    if (p.isActive) {
        $pixel.classList.add('active');
    } else {
        $pixel.classList.remove('active');
    }

    if (p.color != "") {
        $pixel.style.background = p.color;
        $pixel.style.backgroundColor = p.color;
    } else {
        $pixel.style = ""
    }
}

function v_createPixels() {
    let $pixelsDiv = document.querySelector('#pixels');
    let dim = DIM + BSIZE;

    $pixelsDiv.replaceChildren();
    $pixelsDiv.style.width = dim + "vw";

    for (var i = 0; i < dim * dim; i++) {
        let p = pixels[i];
        let newPElm = document.createElement('pixel');

        // mostly for debugging purposes but are also fun to have
        newPElm.id = "pixel-" + i;
        newPElm.setAttribute("x", i % dim);
        newPElm.setAttribute("y", Math.floor(i / dim));

        if (p.isBorder) {
            newPElm.classList.add('border');
        }

        if (p.isActive) {
            newPElm.classList.add('active');
        }

        if (p.color != "") {
            newPElm.style.background = p.color;
            newPElm.style.backgroundColor = p.color;
        }

        $pixelsDiv.appendChild(newPElm);
    }
    $pixelsDiv.style.width = dim + "vw";
}

function initPCards() {
    for (let i = 0; i < REALDIM; i++) {
        let isClickable = true;
        let isHole = true;
        if (i < BSIZE || i >= DIM) {
            isHole = false;
            isClickable = false;
        }
        pcard[i] = new PCardSlot(isHole, isClickable);
    }
}

function initPixels() {
    let realDim = DIM + BSIZE;
    for (let i = 0; i < realDim * realDim; i++) {
        let x = i % realDim;
        let y = Math.floor(i / realDim);
        let isBorder = x < BSIZE || x >= realDim - BSIZE || y < BSIZE || y >= realDim - BSIZE;

        let colors = DEFAULT_COLORS;
        let pRowY = DIM;
        let isPallete = y == pRowY && x >= BSIZE && x <= DIM && x < colors.length + BSIZE;

        let isActive = x == gx && y == gy;

        let color = "";

        if (isPallete) {
            color = colors[x - BSIZE];
            isBorder = false;
        }

        pixels[i] = new Pixel(color, isBorder, isPallete, isActive, true);
    }
}

function initGame() {
    gx = 1;
    gy = 32;
    c = "";
    actions = [];
    initPCards();
    initPixels();
}

function xyToPIndex(x, y) {
    return x + y * REALDIM;
}

// dx, dy = direction x/y
function updateGame(dx, dy) {
    // nx,ny = new x/y
    let nx = gx + dx;
    let ny = gy + dy;

    if (nx < 0 || nx >= REALDIM || ny < 0 || ny >= REALDIM) {
        //perhaps trigger an visible error here
        return;
    }

    pixels[gx + gy * REALDIM].isActive = false;
    pixels[nx + ny * REALDIM].isActive = true;

    let curPixel = pixels[nx + ny * REALDIM];

    if (curPixel.isPallete) {
        c = curPixel.color;
    }

    if (!curPixel.isBlocked || curPixel.isBorder) {
        pixels[nx + ny * REALDIM].color = c;
    }

    let magic = Math.abs((dx + 1) * dx + (dy + 2) * dy);
    let action = ["A", "W", "D", "S"][magic];
    actions.push(action);

    // v_createPixels();
    v_updatePixel(xyToPIndex(gx, gy));
    v_updatePixel(xyToPIndex(nx, ny));
    v_updateActions();
    gx = nx;
    gy = ny;
}

function resetGame() {
    if (!confirm("Do you really want to reset? (3)")) {
        return;
    }

    if (!confirm("Do you really want to reset? (2)")) {
        return;
    }

    if (!confirm("Do you really want to reset? (1)")) {
        return;
    }

    hardResetGame();
}

function copyCode() {
    if (!readCopyCode){
        alert("WARNING: This will replace the content in your clipboard. Press OK and try again if you really want to do this.");
        readCopyCode = true;
    }

    let $code = document.querySelector('#history');
    navigator.clipboard.writeText($code.innerHTML);
}

function hardResetGame() {
    initGame();
    v_createPixels();
    v_updatePCard();
}

document.addEventListener("DOMContentLoaded", function () {
    hardResetGame();
});

document.addEventListener("keydown", function (event) {

    if (document.activeElement.id == "history") {
        return
    }

    switch (event.code) {
        case "KeyW":
        case "ArrowUp":
            updateGame(0, -1);
            break;

        case "KeyS":
        case "ArrowDown":
            updateGame(0, 1);
            break;

        case "KeyA":
        case "ArrowLeft":
            updateGame(-1, 0);
            break;

        case "KeyD":
        case "ArrowRight":
            updateGame(1, 0);
            break;

        case "KeyR":
            // resetGame();
            break;

        default:
            return;
    }
});