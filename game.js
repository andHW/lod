function v_genPixels(dim) {
    $pixelsDiv = document.querySelector('#pixels');
    
    pString = ""
    for (var i = 0; i < dim*dim; i++) {
            pString += '<pixel></pixel>';
    }
    $pixelsDiv.style.width = dim+"vw";
    $pixelsDiv.innerHTML = pString;
}

document.addEventListener("DOMContentLoaded", function () {
    v_genPixels(32);
});