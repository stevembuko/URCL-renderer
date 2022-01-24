let objInput = document.getElementById("sourceFile");
let importButton = document.getElementById("importButton");
let textureInput = document.getElementById("textureFile");
let texturePreview = document.getElementById("texturePreview");
let textureWidthInput = document.getElementById("textureWidth");
let textureHeightInput = document.getElementById("textureHeight");

let canvas = document.createElement("canvas");
let ctx = canvas.getContext("2d");

let img = new Image();

let objText;

objInput.addEventListener("change", function(event) {
    let files = event.target.files;

    let reader = new FileReader();
    reader.onload = function() {
        objText = reader.result;
    }
    reader.readAsText(files[0]);
    
    importButton.disabled = false;
});

importButton.addEventListener("click", function() {
    let fullPath = objInput.value;
    if (fullPath) {
        document.getElementById("objSource").value = objText;

        let startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
        let filename = fullPath.substring(startIndex);
        if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
            filename = filename.substring(1);
        }

        document.getElementById("objectName").value = filename.substring(0, filename.length - 4);

        document.getElementById("useNormals").checked = objText.includes("\nvn ");
    }
});

textureInput.addEventListener("change", function(event) {
    let files = event.target.files;

    let reader = new FileReader();

    reader.onload = function() {
        texturePreview.src = reader.result;

        // let img = new Image();
        img.src = reader.result;

        img.onload = function() {
        }
    }
    reader.readAsDataURL(files[0]);

    let useTexture = document.getElementById("useTexture");
    useTexture.disabled = false;
    useTexture.checked = true;
});

