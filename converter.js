let objectName, scale, useNormals, useTexture;

let vertices, uvs, normals, faces, other;

document.getElementById("convertButton").addEventListener("click", function() {
    let objText = document.getElementById("objSource").value;
    convert(objText);
});

function convert(objText) {
    vertices = [];
    uvs = [];
    normals = [];
    faces = [];
    other = [];

    objectName = document.getElementById("objectName").value;
    scale = document.getElementById("scale").value;
    useNormals = document.getElementById("useNormals").checked;
    useTexture = document.getElementById("useTexture").checked;

    objText.split(/\r?\n/).forEach(line => {
        let type = line.substring(0, 2);
        switch (type) {
            case ("v "):
                loadVertex(line);
                break;
            case ("vt"):
                loadUV(line);
                break;
            case ("vn"):
                loadNormal(line);
                break;
            case ("f "):
                loadFace(line);
                break;
            default:
                other.push(line);
                break;
        } 
    });

    document.getElementById("urclOutput").innerHTML = buildURCLOutput();
}

function loadVertex(line) {
    let v = line.substring(2).split(" ");
    for (let i = 0; i < 3; i++) {
        v[i] = Math.round(Number(v[i]) * scale);
    }
    vertices.push(v);
}

function loadUV(line) {
    if (!useTexture) {
        return;
    }
    let vt = line.substring(3).split(" ");
    for (let i = 0; i < 2; i++) {
        vt[i] = Number(vt[i]); //TODO adjust to provided texture size
    };
    uvs.push(vt);
}

function loadNormal(line) {
    if (!useNormals) {
        return;
    }
    let vn = line.substring(3).split(" ");
    for (let i = 0; i < 3; i++) {
        vn[i] = Number(vn[i]);
    };
    normals.push(vn);
}

function loadFace(line) {
    let f = line.substring(2).split(" ");
    for (let i = 1; i < f.length - 1; i++) {
        let v1 = f[0].split("/");
        let v2 = f[i].split("/");
        let v3 = f[i + 1].split("/");

        let t = [];
        t[0] = Number(v1[0]);
        t[1] = Number(v2[0]);
        t[2] = Number(v3[0]);
        if (useTexture) {
            t.push(Number(v1[1]));
            t.push(Number(v2[1]));
            t.push(Number(v3[1]));
        }
        if (useNormals) {
            t.push(Number(v1[2]));
            t.push(Number(v2[2]));
            t.push(Number(v3[2]));
        }
        faces.push(t);
    }
}

function buildURCLOutput() {
    let output = "." + objectName + "\n";
    output += "\t//map\n";
    output += "\t\tDW[ ." + objectName + "Vertices ] //vertices address\n";
    output += "\t\tDW[ " + (useTexture ? "." + objectName + "UVs ] //UVs address\n" : "0 ] //no UVs\n");
    output += "\t\tDW[ " + (useNormals ? "." + objectName + "Normals ] //normals address\n" : "0 ] //no normals\n");
    output += "\t\tDW[ ." + objectName + "Tris ] //triangles address\n";
    output += "\t\tDW[ " + (useTexture ? "." + objectName + "Texture ] //texture address\n" : "0 ] //no texture\n")
    output += "\t//end map\n";
    output += "\t//vertices\n";
    output += "\t\tDW[ " + vertices.length + " ] //num vertices\n";
    output += "\t." + objectName + "Vertices //x, y, z\n";
    vertices.forEach(v => {
        output  += "\t\tDW[ " + v[0] + " " + v[1] + " " + v[2] + " ]\n";
    });
    output += "\t//end vertices\n";
    if (useTexture) {
        output += "\t//UVs\n";
        output += "\t\tDW[ " + uvs.length + " ] //num UVs\n";
        output += "\t." + objectName + "UVs //u, v\n"
        uvs.forEach(vt => {
            output += "\t\tDW[ " + vt[0] + " " + vt[1] + " ]\n";
        });
        output += "\t//end UVs\n";
    }
    if (useNormals) {
        output += "\t//normals\n";
        output += "\t\tDW[ " + normals.length + " ] //num normals\n";
        output += "\t." + objectName + "Normals //x, y, z\n";
        normals.forEach(vn => {
            output += "\t\tDW[ " + vn[0] + " " + vn[1] + " " + vn[2] + " ]\n";
        });
        output += "\t//end normals\n";
    }
    output += "\t//tris\n";
    output += "\t\tDW[ " + faces.length + " ] //num tris\n";
    output += "\t." + objectName + "Tris //v1, v2, v3";
    if (useTexture) {
        output += ", vt1, vt2, vt3";
    }
    if (useNormals) {
        output += ", vn1, vn2, vn3";
    }
    output += "\n";
    faces.forEach(t => {
        let line = "\t\tDW[ ";
        t.forEach(v => {
            line += v + " ";
        });
        output += line + "]\n";
    });
    output += "\t//end tris\n";
    //TODO add texture
    output += "\t//The following lines could not be translated from the source .obj file:\n"
    other.forEach(line => {
        output += "\t\t// " + line + "\n";
    });
    output += "//end " + objectName;

    return output;
}