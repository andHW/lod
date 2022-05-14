// should've built a game class but whatever
const DIM = 32;
const BSIZE = 3;
const REALDIM = DIM + BSIZE * 2;
const RPLACE_COLORS = [
    "#FFFFFF", "#E4E4E4", "#888888", "#222222",
    "#FFA7D1", "#E50000", "#E59500", "#A06A42",
    "#E5D900", "#94E044", "#02BE01", "#00D3DD",
    "#0083C7", "#0000EA", "#CF6EE4", "#820080"
];
// const DEFAULT_COLORS = ["", "#000", "#FFF", "#F00", "#0F0", "#00F", "#FF0", "#F0F", "#0FF"];
const DEFAULT_COLORS = [""].concat(RPLACE_COLORS);

let readCopyCode = false;
let pixels = new Array(REALDIM * REALDIM);
let pcard = new Array(REALDIM);
let presetPCards = new Array(2);
presetPCards[0] = new Array(REALDIM);
presetPCards[1] = new Array(REALDIM);

// gx,gy = game x,y (the active pixel cordinates)
let gx = -1;
let gy = -1;
let c = "";
let actions = [];

let badHistory = false;

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
    constructor(isHole) {
        this.isHole = isHole;
    }

    punch() {
        this.isHole = true;
    }
}

function v_updateActions() {
    let $historyDiv = document.querySelector('#history');
    $historyDiv.innerHTML = actions.join("");
    $historyDiv.scrollTop = $historyDiv.scrollHeight;

    let $oSizeElm = document.querySelector('#oSize');
    $oSizeElm.innerHTML = actions.length;
}

function toggleCol(colI) {
    for (let i = 0; i < REALDIM; i++) {
        let pi = colI + i * REALDIM;
        pixels[pi].isBlocked = !pixels[pi].isBlocked;
        v_updatePixel(pi);
    }
}

function setCol(colI, block) {
    for (let i = 0; i < REALDIM; i++) {
        let pi = colI + i * REALDIM;
        pixels[pi].isBlocked = block;
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

        newPElm.classList.add('clickable');

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

    if (p.isBlocked && !p.isPallete) {
        $pixel.classList.add('blocked');
    }
    else {
        $pixel.classList.remove('blocked');
    }
}

function v_createPixels() {
    let $pixelsDiv = document.querySelector('#pixels');
    let dim = DIM + BSIZE * 2;

    $pixelsDiv.replaceChildren();
    $pixelsDiv.style.width = dim + "vw";

    for (var i = 0; i < dim * dim; i++) {
        let p = pixels[i];
        let newPElm = document.createElement('pixel');

        // mostly for debugging purposes but are also fun to have
        newPElm.id = "pixel-" + i;
        newPElm.setAttribute("x", i % dim);
        newPElm.setAttribute("y", Math.floor(i / dim));
        $pixelsDiv.appendChild(newPElm);
    }
    $pixelsDiv.style.width = dim + "vw";

    for (let i = 0; i < dim * dim; i++) {
        v_updatePixel(i);
    }
}

function pShift(leftOrRight) {
    // https://stackoverflow.com/questions/1985260/rotate-the-elements-in-an-array-in-javascript
    // Left = -1; Right = 1 
    if (leftOrRight > 0) {
        // LEFT
        pcard.unshift(pcard.pop());
        addAction("H");
    }
    else {
        // RIGHT
        pcard.push(pcard.shift());
        addAction("L");
    }

    for (let i = 0; i < REALDIM; i++) {
        setCol(i, pcard[i].isHole);
    }

    v_updatePCard();

}

function loadPresetPcard(ci) {
    for (let i = 0; i < REALDIM; i++) {
        pcard[i].isHole = presetPCards[ci][i].isHole;
    }
    for (let i = 0; i < REALDIM; i++) {
        setCol(i, !pcard[i].isHole);
    }
    addAction(ci + 1);
    v_updatePCard();
}

function initPCards() {
    for (let i = 0; i < REALDIM; i++) {
        let isHole = false;
        pcard[i] = new PCardSlot(isHole);
        presetPCards[0][i] = new PCardSlot(isHole);
        presetPCards[1][i] = new PCardSlot(false);
    }

    for (let i = 0; i <= REALDIM; i += 2) {
        let isHole = true;
        presetPCards[0][i] = new PCardSlot(isHole);
    }
}

function initPixels() {
    let realDim = DIM + BSIZE * 2;
    for (let i = 0; i < realDim * realDim; i++) {
        let x = i % realDim;
        let y = Math.floor(i / realDim);
        let isBorder = x < BSIZE || x >= realDim - BSIZE || y < BSIZE || y >= realDim - BSIZE;

        let colors = DEFAULT_COLORS;
        let pRowY = DIM + BSIZE;
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
    gx = BSIZE - 1;
    gy = DIM + BSIZE;
    c = "";
    actions = [];
    initPCards();
    initPixels();
}

function xyToPIndex(x, y) {
    return x + y * REALDIM;
}

function addAction(c) {
    actions.push(c);
    v_updateActions();
}

// dx, dy = direction x/y
function updateGame(dx, dy, updateView = true) {
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

    if (!curPixel.isBlocked) {
        pixels[nx + ny * REALDIM].color = c;
    }

    let magic = Math.abs((dx + 1) * dx + (dy + 2) * dy);
    let action = ["A", "W", "D", "S"][magic];
    addAction(action);

    if (updateView) {
        v_updatePixel(xyToPIndex(gx, gy));
        v_updatePixel(xyToPIndex(nx, ny));
    }
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
    if (!readCopyCode) {
        alert("WARNING: This will replace the content in your clipboard. Press OK and try again if you really want to do this.");
        readCopyCode = true;
    }

    let $code = document.querySelector('#history');
    navigator.clipboard.writeText($code.textContent);
}

function hardResetGame() {
    initGame();
    v_createPixels();
    v_updatePCard();
}

function historyGood(text) {
    return /^[WASDP12HL]*$/.test(text.toUpperCase());
}

document.addEventListener("DOMContentLoaded", function () {
    hardResetGame();
    $history = document.querySelector("#history");
});

function handleAction(action, updateView = true) {
    switch (action) {
        case "A":
            updateGame(-1, 0, updateView);
            break;
        case "W":
            updateGame(0, -1, updateView);
            break;
        case "D":
            updateGame(1, 0, updateView);
            break;
        case "S":
            updateGame(0, 1, updateView);
            break;
        case "R":
            //resetGame();
            break;
        case "P":
            punchAll();
            break;
        case "H":
            pShift(-1);
            break;
        case "L":
            pShift(1);
            break;
        case "1":
            loadPresetPcard(0);
            break;
        case "2":
            loadPresetPcard(1);
            break;
        default:
            console.log("BUG: INVALID ACTION");
            break
    }
}

document.addEventListener("keydown", function (event) {

    if (document.activeElement.id == "history") {
        if (event.code == "Enter") {
            event.preventDefault();
            // the operation maniupulator
            if (!historyGood($history.textContent.trim())) {
                $history.classList.add("badHistory");
                badHistory = true;
                return
            }

            badHistory = false;
            $history.classList.remove("badHistory")
            let newActions = $history.textContent.trim().toUpperCase().split("");

            hardResetGame();
            for (let i = 0; i < newActions.length; i++) {
                handleAction(newActions[i]);
            }
            v_updateActions();
            for (let i = 0; i < REALDIM * REALDIM; i++) {
                v_updatePixel(i);
            }
        }
        return
    }

    if (badHistory) {
        alert("Please fix the history before pressing any keys.");
        return;
    }

    switch (event.code) {
        case "KeyW":
        case "ArrowUp":
            handleAction("W");
            break;

        case "KeyS":
        case "ArrowDown":
            handleAction("S");
            break;

        case "KeyA":
        case "ArrowLeft":
            handleAction("A");
            break;

        case "KeyD":
        case "ArrowRight":
            handleAction("D");
            break;

        case "KeyR":
            handleAction("R");
            break;

        case "Space":
            event.preventDefault();
            handleAction("P");
            break;

        case "KeyH":
            handleAction("H");
            break;
        case "KeyL":
            handleAction("L");
            break;
        case "Digit1":
            handleAction("1");
            break;
        case "Digit2":
            handleAction("2");
            break;
        default:
            return;
    }
});

function punchAll() {
    for (let i = 0; i < REALDIM; i++) {
        pcard[i].punch();
        setCol(i, false);
    }
    v_updatePCard();
    addAction("P");
}