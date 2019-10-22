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
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { FlyCamera } from "@babylonjs/core/Cameras/flyCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { PolygonMeshBuilder } from "@babylonjs/core/Meshes/polygonMesh";
import { GridMaterial } from "@babylonjs/materials/grid";

import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";


import * as MyEarcut from "earcut";
import dataLayers from "../data-example/data.json"
import modelledWells from "../data-example/ModeledWells.json"
import verticalWells from "../data-example/verticalWells.json"


/*
 * this.engine
 * this.canvas
 * this.camera
 * this.scene
*/

const _Oil3d = class Oil3d {    
    constructor(canvasId) {
        this.name = "oil3d renderer";
        this.canvas = document.getElementById(canvasId);
        if(this.canvas == null) {
            throw "canvas element for rendering cannot be null, id:" + this.canvasId;
        }

        this.existingVWells=[];
        this.existingDWells=[];
        this.existingNWells=[];
        this.existingPWells=[];
    }

    /**
     * Подготовка координат
     */
    coercionOfCoordinates() {
        //console.log(dataLayers);
        //console.log(dataLayers.Points);
        this.AbskrArray = [];
        this.AbspArray = [];
        let path = [];
        let path2 = [];
        let y = -1; 
        dataLayers.Points.forEach(element => {            
            if(element.y != y) {
                if(y != -1) {
                    this.AbskrArray.push(path);
                    this.AbspArray.push(path2);
                    path = [];
                    path2 = [];
                }
                y = element.y                
            }
            let Absp = element.Absp, Abskr = element.Abskr;
            if(Abskr <= Absp) {
                //console.log("finded:Abskr=" + Abskr + "; Absp=" + Absp);
                Abskr = Absp + 0.02;
            }
            path.push(new Vector3(element.j, Abskr, element.i ));
            path2.push(new Vector3(element.j, Absp, element.i));
            
            //path.push(new Vector3(element.j, Abskr, element.i));
            //path2.push(new Vector3(element.j, Absp, element.i));
        });
    }

    /**
     * prepare Base Wells Coord
     */
    prepareBaseWellsCoord() {
        this.wellsNArray = [];
        this.wellsDArray = [];
        this.wellsParoc = [];
        modelledWells.forEach(well => {
            if(well.nBeg  != well.dBeg && well.nEnd != well.dEnd) {
                //this.wellsNArray.push([new Vector3(well.jBeg, well.iBeg, well.nBeg), new Vector3(well.jEnd, well.iEnd, well.nEnd)]);            
                //this.wellsDArray.push([new Vector3(well.jBeg, well.iBeg, well.dBeg), new Vector3(well.jEnd, well.iEnd, well.dEnd)]);
                let arr1 = [new Vector3(well.jBeg, well.nBeg, well.iBeg), new Vector3(well.jEnd, well.nEnd, well.iEnd)];
                arr1.well = well;
                let arr2 = [new Vector3(well.jBeg, well.dBeg, well.iBeg), new Vector3(well.jEnd, well.dEnd, well.iEnd)];
                arr2.well = well;
                this.wellsNArray.push(arr1);            
                this.wellsDArray.push(arr2);
            } else {
                //this.wellsParoc.push([new Vector3(well.jBeg, well.iBeg, well.nBeg), new Vector3(well.jEnd, well.iEnd, well.nEnd)]);   
                let arr3 = [new Vector3(well.jBeg, well.nBeg, well.iBeg), new Vector3(well.jEnd, well.nEnd, well.iEnd)];
                arr3.well = well;
                this.wellsParoc.push(arr3);            
            }
        });
    }

    /**
     * prepare Base Wells Coord
     */
    prepareVerticalWellsCoord() {        
        this.vertWells = [];
        verticalWells.forEach(well => {  
               // let arr = [new Vector3(well.j, well.i, well.Abskr), new Vector3(well.j, well.i, well.Absp)];
               let arr = [new Vector3(well.j, well.Abskr, well.i), new Vector3(well.j, well.Absp, well.i)];
                arr.well = well;
                this.vertWells.push(arr);
        
        });
    }

    buildScene(callBack) {
        try {
            this.coercionOfCoordinates();
            this.prepareBaseWellsCoord();
            this.prepareVerticalWellsCoord();
        } catch (error) {
            console.log(error);
        }

        let middle = Math.round(this.AbskrArray.length/2);
        let subMiddle = Math.round(this.AbskrArray[middle].length/2);
            console.log(middle + " " + subMiddle);
            console.log(this.AbskrArray[middle][subMiddle]);


        this.engine = new Engine(this.canvas);
            this.scene = new Scene(this.engine);
            this.scene.clearColor = new Color3( 0.5, 0.5, 0.5);
            // camera
            this.camera = new ArcRotateCamera("camera1",  0, 0, 0, this.AbskrArray[middle][subMiddle], this.scene);
            this.camera.setPosition(new Vector3(this.AbskrArray[middle][subMiddle].x, this.AbskrArray[middle][subMiddle].y + 300, this.AbskrArray[middle][subMiddle].z ));
            this.camera.attachControl(this.canvas, true);
            this.camera.lowerRadiusLimit = 1;
            this.camera.upperRadiusLimit = 400;
            this.scene.activeCamera.panningSensibility = 125;
            this.camera.alpha = Math.PI/-2;


            //var camera = new FreeCamera("camera1", new Vector3(0, 5, -10), this.scene);
            //camera.setTarget(Vector3.Zero()); 

             // This creates and positions a universal camera (non-mesh)
            /*var camera = new UniversalCamera("camera", this.AbskrArray[middle][subMiddle], this.scene);
            camera.setTarget(this.AbskrArray[middle][subMiddle]); 
            camera.attachControl(this.canvas, true);
            camera.position = new Vector3(this.AbskrArray[middle][subMiddle].x, this.AbskrArray[middle][subMiddle].y, this.AbskrArray[middle][subMiddle].z + 150);       
            camera.attachControl(this.canvas, true);*/

           /* var camera = new FlyCamera("FlyCamera", new Vector3(this.AbskrArray[middle][subMiddle].x, this.AbskrArray[middle][subMiddle].y+300, this.AbskrArray[middle][subMiddle].z), this.scene);
            camera.setTarget(this.AbskrArray[middle][subMiddle]); 
            camera.rollCorrect = 1;
            camera.bankedTurn = true;
            camera.bankedTurnLimit = Math.PI / 2;
            camera.bankedTurnMultiplier = 1;
            camera.alpha = Math.PI/-2;
            camera.attachControl(this.canvas, true);*/

            // light
            var light = new HemisphericLight("light1", this.AbskrArray[middle][subMiddle], this.scene);
            light.intensity =1;
            // material
            var matKr = new StandardMaterial("mat1", this.scene);
            matKr.alpha = 0.5;
            matKr.diffuseColor = new Color3(0, 0, 1.0);
            matKr.backFaceCulling = false;

             //var mat2 = new GridMaterial("mat2", this.scene);
             var matP = new StandardMaterial("mat2", this.scene);
             matP.alpha = 1;
             matP.diffuseColor = new Color3(0.2, 0.7, 0.2);
             matP.backFaceCulling = false;

            //Создание слоев
            var ribbon = Mesh.CreateRibbon("rib", this.AbskrArray, false, false, 0, this.scene);
            ribbon.material = matKr;

            var ribbon2 = Mesh.CreateRibbon("rib2", this.AbspArray, false, false, 0, this.scene);
            ribbon2.material = matP;

           this.showAxis(50, this.scene);

            this.engine.runRenderLoop(() => {
                this.scene.render();
            });

            if(callBack)
                callBack();
    }

    makeTextPlane (text, color, size, scene, hasAlpha) {
        if(hasAlpha == undefined) {
            hasAlpha = true;
        }
        var dynamicTexture = new DynamicTexture("DynamicTexture", 50, scene, true);
        dynamicTexture.hasAlpha = hasAlpha;
        dynamicTexture.drawText(text, 5, 40, "bold 36px Arial", color , "transparent", true);
        var plane = new Mesh.CreatePlane("TextPlane", size, scene, true);
        plane.material = new StandardMaterial("TextPlaneMaterial", scene);
        plane.material.backFaceCulling = false;
        plane.material.specularColor = new Color3(0, 0, 0);
        plane.material.diffuseTexture = dynamicTexture;
        return plane;
     };

    // show axis
  	showAxis(size, scene) {
    	var axisX = Mesh.CreateLines("axisX", [ 
      		new Vector3.Zero(), new Vector3(size, 0, 0), new Vector3(size * 0.95, 0.05 * size, 0), 
      		new Vector3(size, 0, 0), new Vector3(size * 0.95, -0.05 * size, 0)
      	], scene);
    	axisX.color = new Color3(1, 0, 0);
    	var xChar = this.makeTextPlane("X" + (0.9 * size), "red", size / 10, scene);
    	xChar.position = new Vector3(0.9 * size, -0.05 * size, 0);
    	var axisY = Mesh.CreateLines("axisY", [
        	new Vector3.Zero(), new Vector3(0, size, 0), new Vector3( -0.05 * size, size * 0.95, 0), 
        	new Vector3(0, size, 0), new Vector3( 0.05 * size, size * 0.95, 0)
        ], scene);
    	axisY.color = new Color3(0, 1, 0);
    	var yChar = this.makeTextPlane("Y" + (size), "green", size / 10, scene);
    	yChar.position = new Vector3(0, 0.9 * size, -0.05 * size);
    	var axisZ = Mesh.CreateLines("axisZ", [
        	new Vector3.Zero(), new Vector3(0, 0, size), new Vector3( 0 , -0.05 * size, size * 0.95),
        	new Vector3(0, 0, size), new Vector3( 0, 0.05 * size, size * 0.95)
        ], scene);
    	axisZ.color = new Color3(0, 0, 1);
    	var zChar = this.makeTextPlane("Z" + (0.9 * size), "blue", size / 10, scene);
    	zChar.position = new Vector3(0, 0.05 * size, 0.9 * size);
    }
    /**
     * Построение вертикальных скважин
     * @param {Массив вертикальных скважин} vertWells 
     */
    buildVerticalWells(vertWells) {
        let vw = (vertWells != undefined) ? vertWells : this.vertWells;
        vw.forEach(points => {
            let name = (points.well.Well) ? points.well.Well : "";
            var lines = MeshBuilder.CreateLines(name, {points: points, updatable: true}, this.scene);  
            lines.color = new Color3(1,0.2,0.4);
            this.existingVWells.push(lines);
            if(name.length != 0) {
                lines.textDyn = this.makeTextPlane(name, "black", 1.5, this.scene, true);
                lines.textDyn.position = points[0];
            }
        });
    }

    buildHorizontalWells(wellsNArray, wellsDArray, wellsParoc) {
        let wn = (wellsNArray != undefined) ? wellsNArray : this.wellsNArray;
        wn.forEach(points => {
            let name = (points.well.num) ? points.well.num : ""
            var lines = MeshBuilder.CreateLines(name, {points: points, updatable: true}, this.scene);  
            lines.color = new Color3(1, 0, 0);
            this.existingNWells.push(lines);
            if(name.length != 0) {
                lines.textDyn = this.makeTextPlane(points, "white", 1, this.scene);
                lines.textDyn.position = points[0];
            }
        });  
        
        let wd = (wellsDArray != undefined) ? wellsDArray : this.wellsDArray;
        wd.forEach(points => {
            let name = (points.well.num) ? points.well.num : ""
            var lines = MeshBuilder.CreateLines(name, {points: points, updatable: true}, this.scene);  
            lines.color = new Color3(0, 1, 1);
            this.existingDWells.push(lines);
            if(name.length != 0) {
                lines.textDyn = this.makeTextPlane(points, "white", 1, this.scene);
                lines.textDyn.position = points[0];
            }
        }); 

        let wp = (wellsParoc != undefined) ? wellsParoc : this.wellsParoc;
        wp.forEach(points => {
            let name = (points.well.num) ? points.well.num : ""
            var lines = MeshBuilder.CreateLines(name, {points: points, updatable: true}, this.scene);  
            lines.color = new Color3(1, 1, 1);
            this.existingPWells.push(lines);
            if(name.length != 0) {
                lines.textDyn = this.makeTextPlane(points, "white", 1, this.scene);
                lines.textDyn.position = points[0];
            }
        }); 
    }   

    clearVWells() {
        this.clearMeshByArray(this.existingVWells);            
    }

    clearDWels() {
        this.clearMeshByArray(this.existingDWells);        
    }

    clearNWells() {
        this.clearMeshByArray(this.existingNWells);
    }

    clearPWells() {
        this.clearMeshByArray(this.existingPWells);
    }
    clearMeshByArray(array) {
        array.forEach(element => {
            element.textDyn.dispose();
            element.dispose();
        });
        array=[];
    }

    clearWellByName(name) {
        this.existingVWells.forEach(function(item, index, object) {
            if(item.Well == name) {
                item.textDyn.dispose();
                item.dispose();
            }
            object.splice(index, 1);
        });
    }
    
}

 //Oil3d;
export { _Oil3d as Oil3d };