const objInput = document.getElementById("sourceFile");
const importButton = document.getElementById("importButton");
const textureInput = document.getElementById("textureFile");

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
        document.getElementById("texturePreview").src = reader.result;
    }
    reader.readAsDataURL(files[0]);

    let useTexture = document.getElementById("useTexture");
    useTexture.disabled = false;
    useTexture.checked = true;
});

