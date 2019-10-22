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
    constructor(canvas) {
        this.name = "oil3d renderer";
        this.canvas = document.getElementById(canvasId);
        if(this.canvas == null) {
            throw "canvas element for rendering cannot be null, id:" + this.canvasId;
        }
    }
}


export { _Oil3dGuiBuilder as Oil3dGuiBuilder };