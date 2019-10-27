import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math";
import { Vector2 } from "@babylonjs/core/Maths/math";
import { Path2 } from "@babylonjs/core/Maths/math";
import { Path3D } from "@babylonjs/core/Maths/math";
import { Color4 } from "@babylonjs/core/Maths/math";
import { Color3 } from "@babylonjs/core/Maths/math"
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { PolygonMeshBuilder } from "@babylonjs/core/Meshes/polygonMesh";

import { GridMaterial } from "@babylonjs/materials/grid";
//import { StandardMaterialDefines } from "@babylonjs/core/Materials/standardMaterial";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";


import * as MyEarcut from "earcut";
import dataLayers from "../data-example/data.json"
import modelledWells from "../data-example/ModeledWells.json"
import verticalWells from "../data-example/verticalWells.json"

//import DynamicTerrain from "../externals/babylon.dynamicTerrain";
//import "../externals/babylon.dynamicTerrain.js";


const _Oil3dGuiBuilder =  class Oil3dGuiBuilder {    
    /*constructor(height, width) {
        this.name = 'Polygon';
        this.height = height;
        this.width = width;
    }*/
    constructor() {       
        LinearColorInterpolator lc = new LinearColorInterpolator();
    }
}


const _ColorI = class ColorI  {
      constructor(hexOrObject) {
        this.obj;
        this.r = obj.r;
        this.g = obj.g;
        this.b = obj.b;

         if (hexOrObject instanceof Object) {
            obj = hexOrObject; 
        } else {
            obj = LinearColorInterpolator.convertHexToRgb(hexOrObject);
        }
      }
     asRgbCss() {
        return "rgb("+this.r+", "+this.g+", "+this.b+")";
     }
}

const _LinearColorInterpolator = class LinearColorInterpolator {
    constructor() {

    }
    // convert 6-digit hex to rgb components;
    // accepts with or without hash ("335577" or "#335577")
    convertHexToRgb(hex) {
        match = hex.replace(/#/,'').match(/.{1,2}/g);
        return new ColorI({
            r: parseInt(match[0], 16),
            g: parseInt(match[1], 16),
            b: parseInt(match[2], 16)
        });
    },
    // left and right are colors that you're aiming to find
    // a color between. Percentage (0-100) indicates the ratio
    // of right to left. Higher percentage means more right,
    // lower means more left.
    findColorBetween(left, right, percentage) {
        newColor = {};
        components = ["r", "g", "b"];
        for (var i = 0; i < components.length; i++) {
            c = components[i];
            newColor[c] = Math.round(left[c] + (right[c] - left[c]) * percentage / 100);
        }
        return new ColorI(newColor);
    }
}


export { _ColorT as ColorT };
export { _LinearColorInterpolator as LinearColorInterpolator };
export { _Oil3dGuiBuilder as Oil3dGuiBuilder };