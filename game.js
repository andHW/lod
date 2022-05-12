// should've built a game class but whatever
const DIM = 32;
const BSIZE = 3;
const REALDIM = DIM + BSIZE;
const DEFAULT_COLORS = ["", "#000", "#FFF", "#F00", "#0F0", "#00F", "#FF0", "#F0F", "#0FF"];

let pixels = new Array(DIM * DIM);
let gx = 0;
let gy = 30;
let c = "";
let actions = [];


class Pixel {
    constructor(color, isBorder, isPallete, isActive) {
        this.color = color;
        this.isBorder = isBorder;
        this.isActive = isActive;
        this.isPallete = isPallete;
    }
}

function v_updatePixels() {
    let $pixelsDiv = document.querySelector('#pixels');
    let dim = DIM + BSIZE;

    $pixelsDiv.replaceChildren();
    $pixelsDiv.style.width = dim + "vw";

    for (var i = 0; i < dim * dim; i++) {
        let p = pixels[i];
        let newPElm = document.createElement('pixel');
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
            newPElm.style.background = "#FFF";
            newPElm.style.backgroundColor = p.color;
        }

        $pixelsDiv.appendChild(newPElm);
    }
    $pixelsDiv.style.width = dim + "vw";
}

function initPixels() {
    let realDim = DIM + BSIZE;
    for (let i = 0; i < realDim * realDim; i++) {
        let x = i % realDim;
        let y = Math.floor(i / realDim);
        let isBorder = x < BSIZE || x >= realDim - BSIZE || y < BSIZE || y >= realDim - BSIZE;
        
        let colors = DEFAULT_COLORS;
        let pRowY = DIM;
        let isPallete = y == pRowY && x >= BSIZE && x <= DIM && x <= colors.length + 1;

        let isActive = x == gx && y == gy;

        let color = "";

        if (isPallete) {
            color = colors[x - BSIZE];
            isBorder = false;
        }

        pixels[i] = new Pixel(color, isBorder, isPallete, isActive);
    }
}

function initGame() {
    gx = 1;
    gy = 32;
    c = "";
    actions = [];
    initPixels();
}

function updateGame(dx, dy) {
    let nx = gx + dx;
    let ny = gy + dy;

    if (nx < 0 || nx >= REALDIM || ny < 0 || ny >= REALDIM) {
        //perhaps trigger an visible error here
        return;
    }

    pixels[gx + gy * REALDIM].isActive = false;
    gx = nx;
    gy = ny;
    pixels[gx + gy * REALDIM].isActive = true;

    let curPixel = pixels[gx + gy * REALDIM];

    if (curPixel.isPallete) {
        c = curPixel.color;
    }

    if (c) {
        pixels[gx + gy * REALDIM].color = c;
    }

    v_updatePixels();
}

function resetGame() {
    if (!confirm("Do you really want to reset? (3)")){
        return;
    }

    if (!confirm("Do you really want to reset? (2)")){
        return;
    }

    if (!confirm("Do you really want to reset? (1)")){
        return;
    }

    initGame();
    v_updatePixels();
}

document.addEventListener("DOMContentLoaded", function () {
    initGame();
    v_updatePixels();
});

document.addEventListener("keydown", function (event) {
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
            resetGame();
            break;

        default:
            return;
    }
});