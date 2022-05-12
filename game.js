// should've built a game class but whatever
const DIM = 32;
const BSIZE = 2;
const DEFAULT_COLORS = ["", "#000", "#FFF", "#F00", "#0F0", "#00F", "#FF0", "#F0F", "#0FF"];

let pixels = new Array(DIM * DIM);
let gx = 0;
let gy = 0;
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

        let pRowY = DIM;
        let isPallete = y == pRowY && x >= BSIZE && x <= DIM;

        let isActive = x == gx && y == gy;

        let colors = DEFAULT_COLORS;
        let color = "";

        if (isPallete) {
            color = colors[x - BSIZE];
            isBorder = false;
        }

        pixels[i] = new Pixel(color, isBorder, isPallete, isActive);
    }
}

function initGame() {
    gx = 0;
    gy = 0;
    c = "";
    actions = [];
    initPixels();
}

function updateGame(nx, ny) {
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
            break;

        default:
            return;
    }
});