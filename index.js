const objInput = document.getElementById("sourceFile");
const importButton = document.getElementById("importButton");

let objText;

let importObj = function(event) {
    let input = event.target;

    let reader = new FileReader();
    reader.onload = function() {
        objText = reader.result;
    }
    reader.readAsText(input.files[0]);
    
    importButton.disabled = false;
}
objInput.addEventListener("change", importObj);

importButton.addEventListener("click", function() {
    let fullPath = objInput.value;
    if (fullPath) {
        document.getElementById("objSource").innerHTML = objText;

        let startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
        let filename = fullPath.substring(startIndex);
        if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
            filename = filename.substring(1);
        }

        document.getElementById("objectName").value = filename.substring(0, filename.length - 4);

        document.getElementById("useUVs").checked = objText.includes("vt ");
        document.getElementById("useNormals").checked = objText.includes("vn ");
    }
});

document.getElementById("textureFile").addEventListener("change", function() {
    //TODO load image file
    document.getElementById("useTexture").checked = true;
});

