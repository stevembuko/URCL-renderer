let objectName, scale, useNormals, useTexture, textureWidth, textureHeight, colorType;

let vertices, uvs, normals, triVertices, triUvs, triNormals, other, texture;

document.getElementById("convertButton").addEventListener("click", function() {
    let objText = document.getElementById("objSource").value;
    document.getElementById("urclOutput").innerHTML = convert(objText);
});

function convert(objText) {

    objectName = document.getElementById("objectName").value;
    scale = document.getElementById("scale").value;
    useNormals = document.getElementById("useNormals").checked;
    useTexture = document.getElementById("useTexture").checked;
    textureWidth = Math.floor(document.getElementById("textureWidth").value);
    textureHeight = Math.floor(document.getElementById("textureHeight").value);
    colorType = document.getElementById("colorType").value;

    canvas.width = textureWidth;
    canvas.height = textureHeight;
    ctx.clearRect(0, 0, textureWidth, textureHeight);
    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, textureWidth, textureHeight);

    if (!objText) {
        return "Error: .obj text is empty";
    }

    if (useTexture) {
        if (textureWidth <= 0 || textureHeight <= 0) {
            return "Error: image width and height must be defined and greater than zero";
        }
        if (!document.getElementById("textureFile").value) {
           return "Error: no texture provided";
        }
    }

    vertices = [];
    uvs = [];
    normals = [];
    triVertices = [];
    triUvs = [];
    triNormals = [];
    other = [];
    texture = [];

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

    if (useNormals && normals.length == 0) {
        return "Error: .obj contains no normals data";
    }
    if (useTexture && uvs.length == 0) {
        return "Error: .obj contains no UV data";
    }

    if (useTexture) {
        let imgData = ctx.getImageData(0, 0, textureWidth, textureHeight).data;

        for (let i = 0; i < imgData.length; i += 4) {
            switch(colorType) {
                case "PICO8":
                    texture.push(toPICO8(imgData[i], imgData[i + 1], imgData[i+2]));
                    break;
                case "APICO8":
                    texture.push(toAPICO8(imgData[i], imgData[i + 1], imgData[i+2], imgData[i+3]));
                case "MONO":
                    texture.push(toMONO(imgData[i], imgData[i + 1], imgData[i+2]));
                    break;
                case "BIN":
                    texture.push(toBIN(imgData[i], imgData[i + 1], imgData[i+2]));
                    break;
                case "RGB8":
                    texture.push(toRGB8(imgData[i], imgData[i + 1], imgData[i+2]));
                    break;
                case "ARGB8":
                    texture.push(toARGB8(imgData[i], imgData[i + 1], imgData[i+2], imgData[i+3]));
                    break;
                case "RGB16":
                    texture.push(toRGB16(imgData[i], imgData[i + 1], imgData[i+2]));
                    break;
                case "ARGB16":
                    texture.push(toARGB16(imgData[i], imgData[i + 1], imgData[i+2], imgData[i+3]));
                    break;
                case "RGB24":
                    texture.push(toRGB24(imgData[i], imgData[i + 1], imgData[i+2]));
                    break;
                case "ARGB32":
                    texture.push(toARGB32(imgData[i], imgData[i + 1], imgData[i+2], imgData[i+3]));
                    break;
                case "RGBI":
                    texture.push(toRGBI(imgData[i], imgData[i + 1], imgData[i+2]));
                    break;
            }
        }
    }

    compressVertices();
    if (useTexture) {
        compressUvs();
    }
    if (useNormals) {
        compressNormals();
    }

    return buildURCLOutput();
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
    vt[0] = Math.round(vt[0] * 256);
    vt[1] = Math.round((1 - vt[1]) * 256);
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

        let tv = [];
        tv[0] = Number(v1[0] - 1);
        tv[1] = Number(v2[0] - 1);
        tv[2] = Number(v3[0] - 1);
        triVertices.push(tv);

        if (useTexture) {
            let tu = [];
            tu.push(Number(v1[1] - 1));
            tu.push(Number(v2[1] - 1));
            tu.push(Number(v3[1] - 1));
            triUvs.push(tu);
        }

        if (useNormals) {
            let tn = [];
            tn.push(Number(v1[2] - 1));
            tn.push(Number(v2[2] - 1));
            tn.push(Number(v3[2] - 1));
            triNormals.push(tn);
        }
    }
}

function toPICO8(r, g, b) {
    let colors = [
        [0, 0, 0],
        [29, 43, 83],
        [126, 37, 83],
        [0, 135, 81],
        [171, 82, 54],
        [95, 87, 79],
        [194, 195, 199],
        [255, 241, 232],
        [255, 0, 77],
        [255, 163, 0],
        [255, 236, 39],
        [0, 288, 54],
        [41, 173, 255],
        [131, 118, 156],
        [255, 119, 168],
        [255, 204, 170]
    ];

    let closestColor;
    let minDistance = Infinity;
    for (let i = 0; i < colors.length; i++) {
        let c = colors[i];
        let x = (r - c[0]);
        let y = (g - c[1]);
        let z = (b - c[2]);
        let distance = Math.sqrt(x * x + y * y + z * z);
        if (distance < minDistance) {
            minDistance = distance;
            closestColor = i;
        }
    }

    return closestColor;
}

function toAPICO8(r, g, b, a) {
    let color = toPICO8(r, g, b, a);

    let alpha = 0
    if (a != 0) {
        alpha = 0b10000;
    }

    return alpha | color;
}

function toMONO(r, g, b) {
    return Math.max(r, g, b);
}

function toBIN(r, g, b) {
    return Math.max(r, g, b) >= 128 ? 1 : 0;
}

function toRGB8(r, g, b) {
    r = 0b11100000 & r;
    g = 0b11100000 & g;
    b = 0b11000000 & b;
    return r | (g >> 3) | (b >> 6);
}

function toARGB8(r, g, b, a) {
    a = 0b11000000 & a;
    r = 0b11000000 & r;
    g = 0b11000000 & g;
    b = 0b11000000 & b;
    return a | (r >> 2) | (g >> 4) | (b >> 6);
}

function toRGB16(r, g, b) {
    r = 0b11111000 & r;
    g = 0b11111100 & g;
    b = 0b11111000 & b;
    return (r << 8) | (g << 3) | (b >> 3);
}

function toARGB16(r, g, b, a) {
    a = 0b11110000 & a;
    r = 0b11110000 & r;
    g = 0b11110000 & g;
    b = 0b11110000 & b;
    return (a << 8) | (r << 4) | g | (b >> 4);
}

function toRGB24(r, g, b) {
    return (r << 16) | (g << 8) | b;
}

function toARGB32(r, g, b, a) {
    return (a << 24) | (r << 16) | (g << 8) | b;
}

function toRGBI(r, g, b) {
    max = Math.max(r, g, b)
    if (max < 64) {
        return 0b0000
    } else {
        r = Math.round(r / max);
        g = Math.round(g / max);
        b = Math.round(g / max);
        let i = Math.round(max / 255 * 0.75);
        return (r << 3) | (g << 2) | (b << 1) | i;
    }
}

function compressVertices() {
    let compressedVertices = [vertices[0]];
    let compressionGuide = [0];
    for (let i = 1; i < vertices.length; i++) {
        let v = vertices[i];
        let index = -1;
        for (let j = 0; j < compressedVertices.length; j++) {
            let cv = compressedVertices[j];
            if (v[0] == cv[0] && v[1] == cv[1] && v[2] == cv[2]) {
                index = j;
                break;
            }
        }
        if (index == -1) {
            compressionGuide.push(compressedVertices.length);
            compressedVertices.push(v);
        } else {
            compressionGuide.push(index);
        }
        
    }

    vertices = compressedVertices;
    triVertices.forEach(t => {
        t[0] = compressionGuide[t[0]];
        t[1] = compressionGuide[t[1]];
        t[2] = compressionGuide[t[2]];
    });
}

function compressUvs() {
    let compressedUvs = [uvs[0]];
    let compressionGuide = [0];
    for (let i = 1; i < uvs.length; i++) {
        let v = uvs[i];
        let index = -1;
        for (let j = 0; j < compressedUvs.length; j++) {
            let cv = compressedUvs[j];
            if (v[0] == cv[0] && v[1] == cv[1] && v[2] == cv[2]) {
                index = j;
                break;
            }
        }
        if (index == -1) {
            compressionGuide.push(compressedUvs.length);
            compressedUvs.push(v);
        } else {
            compressionGuide.push(index);
        }
        
    }
    
    uvs = compressedUvs;
    triUvs.forEach(t => {
        t[0] = compressionGuide[t[0]];
        t[1] = compressionGuide[t[1]];
        t[2] = compressionGuide[t[2]];
    });
}

function compressNormals() {
    let compressedNormals = [normals[0]];
    let compressionGuide = [0];
    for (let i = 1; i < normals.length; i++) {
        let v = normals[i];
        let index = -1;
        for (let j = 0; j < compressedNormals.length; j++) {
            let cv = compressedNormals[j];
            if (v[0] == cv[0] && v[1] == cv[1] && v[2] == cv[2]) {
                index = j;
                break;
            }
        }
        if (index == -1) {
            compressionGuide.push(compressedNormals.length);
            compressedNormals.push(v);
        } else {
            compressionGuide.push(index);
        }
        
    }
    
    normals = compressedNormals;
    triNormals.forEach(t => {
        t[0] = compressionGuide[t[0]];
        t[1] = compressionGuide[t[1]];
        t[2] = compressionGuide[t[2]];
    });
}

function buildNewObjOutput() {
    let output = "";
    vertices.forEach(v => {
        output += "v " + v[0] + " " + v[1] + " " + v[2] + "\n";
    });
    uvs.forEach(vt => {
        output += "vt " + vt[0] / 256 + " " + vt[1] / 256 + "\n";
    });
    normals.forEach(vn => {
        output += "vn" + vn[0] + " " + vn[1] + " " + vn[2] + "\n";
    });
    for (let i = 0; i < triVertices.length; i++) {
        let f = triVertices[i];
        let t = triUvs[i];
        let n = triNormals[i];
        output += "f";
        for (let j = 0; j < 3; j++) {
            output += " " + (f[j] + 1);
            if (useTexture) {
                output += "/" + (t[j] + 1);
            }
            if (useNormals) {
                if (useTexture) {
                    output += "/" + (n[j] + 1);
                } else {
                    output += "//" + (n[j] + 1);
                }
            }
        }
        output += "\n";
    }
    return output;
}

function buildURCLOutput() {
    let output = "." + objectName + "\n";

    output += "\t//map\n";
    output += "\t\tDW [ ." + objectName + "Vertices ] //vertices address\n";
    output += "\t\tDW [ " + (useTexture ? "." + objectName + "UVs ] //UVs address\n" : "0 ] //no UVs\n");
    output += "\t\tDW [ " + (useNormals ? "." + objectName + "Normals ] //normals address\n" : "0 ] //no normals\n");
    output += "\t\tDW [ ." + objectName + "TriVertices ] //triangle vertices address\n";
    output += "\t\tDW [ ." + (useTexture ? objectName + "TriUVs ] //triangle UVs address\n" : "0 ] //no UVs\n");
    output += "\t\tDW [ " + (useNormals ? "." + objectName + "TriNormals ] //triangle normals address\n" : "0 ] //no normals\n");
    output += "\t\tDW [ " + (useTexture ? "." + objectName + "Texture ] //texture address\n" : "0 ] //no texture\n")
    output += "\t//end map\n";

    output += "\t//vertices\n";
    output += "\t\tDW [ " + vertices.length + " ] //num vertices\n";
    output += "\t." + objectName + "Vertices //x, y, z\n";
    vertices.forEach(v => {
        output  += "\t\tDW [ " + v[0] + " " + v[1] + " " + v[2] + " ]\n";
    });
    output += "\t//end vertices\n";

    if (useTexture) {
        output += "\t//UVs\n";
        output += "\t\tDW [ " + uvs.length + " ] //num UVs\n";
        output += "\t." + objectName + "UVs //u, v\n"
        uvs.forEach(vt => {
            output += "\t\tDW [ " + vt[0] + " " + vt[1] + " ]\n";
        });
        output += "\t//end UVs\n";
    }

    if (useNormals) {
        output += "\t//normals\n";
        output += "\t\tDW [ " + normals.length + " ] //num normals\n";
        output += "\t." + objectName + "Normals //x, y, z\n";
        normals.forEach(vn => {
            output += "\t\tDW [ " + vn[0] + " " + vn[1] + " " + vn[2] + " ]\n";
        });
        output += "\t//end normals\n";
    }

    output += "\t//tris\n";
    output += "\t\tDW [ " + triVertices.length + " ] //num tris\n";
    output += "\t." + objectName + "TriVertices //v1, v2, v3\n";
    triVertices.forEach(tv => {
        output += "\t\tDW [ " + tv[0] + " " + tv[1] + " " + tv[2] + " ]\n"
    });
    if (useTexture) {
        output += "\t." + objectName + "TriUVs //t1, t2, t3\n";
        triUvs.forEach(tt => {
            output += "\t\tDW [ " + tt[0] + " " + tt[1] + " " + tt[2] + " ]\n"
        }); 
    }
    if (useNormals) {
        output += "\t." + objectName + "TriNormlas //n1, n2, n3\n";
        triNormals.forEach(tn => {
            output += "\t\tDW [ " + tn[0] + " " + tn[1] + " " + tn[2] + " ]\n";
        });
    }
    output += "\t//end tris\n";

    if (useTexture) {
        output += "\t//texture\n";
        output += "\t\tDW [ " + textureWidth + " " + textureHeight + " ] //width, height\n";
        output += "\t." + objectName + "Texture\n";
        for (let i = 0, x = 0; x < textureHeight; x++) {
            output += "\t\tDW [ ";
            for (let y = 0; y < textureWidth; y++) {
                output += texture[i] + " ";
                i++;
            }
            output += "]\n";
        }
        output += "\t//end texture\n";
    }

    output += "\t//The following lines could not be translated from the source .obj file:\n"
    other.forEach(line => {
        output += "\t\t// " + line + "\n";
    });
    output += "//end " + objectName;

    return output;
}