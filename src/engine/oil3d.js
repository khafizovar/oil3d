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
import { CubicEase } from "@babylonjs/core/Animations";
import { EasingFunction } from "@babylonjs/core/Animations";
import { Animation } from "@babylonjs/core/Animations/animation";
import { GradientMaterial } from "@babylonjs/materials";

import  { VertexBuffer } from "@babylonjs/core/Meshes";



import * as MyEarcut from "earcut";
import dataLayers from "../data-example/data.json"
import modelledWells from "../data-example/ModeledWells.json"
import verticalWells from "../data-example/verticalWells.json"

import interpolate from "color-interpolate";



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

        this.scaleY = 2;

        this.pColor = new Color3(1, 1, 1);
        this.vColor = new Color3(1,0.2,0.4);
        this.dColor = new Color3(0, 1, 1);
        this.nColor = new Color3(1, 0, 0);

        this.colormap = interpolate(['white', '#121072', 'blue']);
       /* let black = colormap(0); // 'rgb(0, 0, 0)'
        let white = colormap(1); // 'rgb(255, 255, 255)'
        let gray = colormap(.5); // 'rgb(128, 128, 128)'*/
    }

    /**
     * Подготовка координат
     */
    coercionOfCoordinates() {
        //console.log(dataLayers);
        //console.log(dataLayers.Points); 
        this.AbskrArray = [];
        this.AbspArray = [];
        this.Kpor = [];

        this.arrayColor = [];
        let path = [];
        let path2 = [];
        let y = -1; 
        dataLayers.Points.forEach(element => {   
            this.Kpor.push(element.Knn);

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
            /*if(Abskr <= Absp) {
                //console.log("finded:Abskr=" + Abskr + "; Absp=" + Absp);
                Abskr = Absp + 0.02;
            }*/
            if(Abskr == Absp) {
                //console.log("finded:Abskr=" + Abskr + "; Absp=" + Absp);
                Abskr = Absp - 0.03;
            }
            path.push(new Vector3(element.j, Abskr/this.scaleY, element.i ));
            path2.push(new Vector3(element.j, Absp/this.scaleY, element.i));            
            //path.push(new Vector3(element.j, Abskr, element.i));
            //path2.push(new Vector3(element.j, Absp, element.i));
        });
        console.log("Max Kpor:" + Math.max.apply(Math, dataLayers.Points.map(function(o) { return o.Knn; })));
        console.log("Max Kpor:" + Math.min.apply(Math, dataLayers.Points.map(function(o) { return o.Knn; })));
        this.Kpormax = Math.max.apply(null, dataLayers.Points.map(function(o) { return o.Knn; }));
        this.Kpormin = Math.min.apply(null, dataLayers.Points.map(function(o) { return o.Knn; }));
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
                let arr1 = [new Vector3(well.jBeg, well.nBeg/this.scaleY, well.iBeg), new Vector3(well.jEnd, well.nEnd/this.scaleY, well.iEnd)];
                arr1.well = well;
                let arr2 = [new Vector3(well.jBeg, well.dBeg/this.scaleY, well.iBeg), new Vector3(well.jEnd, well.dEnd/this.scaleY, well.iEnd)];
                arr2.well = well;
                this.wellsNArray.push(arr1);            
                this.wellsDArray.push(arr2);
            } else {
                //this.wellsParoc.push([new Vector3(well.jBeg, well.iBeg, well.nBeg), new Vector3(well.jEnd, well.iEnd, well.nEnd)]);   
                let arr3 = [new Vector3(well.jBeg, well.nBeg/this.scaleY, well.iBeg), new Vector3(well.jEnd, well.nEnd/this.scaleY, well.iEnd)];
                arr3.well = well;
                this.wellsParoc.push(arr3);            
            }
        });
    }

    /**;
     * prepare Base Wells Coord
     */
    prepareVerticalWellsCoord() {        
        this.vertWells = [];
        verticalWells.forEach(well => {  
            if(well.Abskr != well.Absp) { // отсеиваем те скважины кровля и подошва которых равно самой себе (скважины добавлдены для закрытия залежи)
               // let arr = [new Vector3(well.j, well.i, well.Abskr), new Vector3(well.j, well.i, well.Absp)];
               let arr = [new Vector3(well.j, well.Abskr/this.scaleY, well.i), new Vector3(well.j, well.Absp/this.scaleY, well.i)];
                arr.well = well;
                this.vertWells.push(arr);
            }
        
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
            let vv = this.AbskrArray[middle][subMiddle];
            var light = new HemisphericLight("light1", new Vector3(vv.x, vv.y - 250, vv.z), this.scene);
            light.intensity =1;
            // material
            var matKr = new StandardMaterial("mat1", this.scene);
            matKr.alpha = 1;
            //matKr.diffuseColor = new Color3(0, 0, 1.0);
            matKr.backFaceCulling = false;

           /* var matKr = new GradientMaterial("mat1", this.scene);
            console.log("gradient");
            window.gr = matKr;
            matKr.alpha =1;
           
            matKr.backFaceCulling = false;
            matKr.topColor = new Color3(0, 0, 1);
            matKr.bottomColor = new Color3(0, 1, 0);
            
            matKr.offset = .5;
            matKr.scale = 0.05999999999999992;

            ///tex.vOffset = .5 / (rampHeight);
            //tex.vScale  = (rampHeight - 1) / rampHeight;
            matKr.smoothness = 1;
            //matKr.scale = 1;*/

             var matP = new GridMaterial("mat2", this.scene);
             //var matP = new StandardMaterial("mat2", this.scene);
             matP.alpha = 1;
             matP.diffuseColor = new Color3(0.2, 0.7, 0.2);
             matP.backFaceCulling = false;

            //Создание слоев
            var ribbon = Mesh.CreateRibbon("rib", this.AbskrArray, false, false, 0, this.scene);
            ribbon.material = matKr;
            window.rib = ribbon;

            var ribbon2 = Mesh.CreateRibbon("rib2", this.AbspArray, false, false, 0, this.scene);
            ribbon2.material = matP;

            console.log(this.Kpormax + " " + this.Kpormin);
            
            var colors = ribbon.getVerticesData(VertexBuffer.ColorKind);           
            if(!colors) {
                colors = [];            
                var positions = ribbon.getVerticesData(VertexBuffer.PositionKind);
                console.log(positions.length + " " + this.Kpor.length);
                for(var p = 0; p < positions.length / 3; p++) {
                    let c1 = this.colormap(0);
                    //let c2 = this.colormap(0);
                    //let c3 = this.colormap(0);
                    //console.log(c1);
                    if(p < this.Kpor.length) {
                        if(this.Kpor[p] > 0.1) {
                            console.log(JSON.stringify(this._getRGB(this.colormap(this.Kpormin + ((this.Kpormax - this.Kpormin)) * this.Kpor[p]))) + " "+ this.colormap(this.Kpormin + ((this.Kpormax - this.Kpormin)) * this.Kpor[p]) + " " + this.Kpor[p] + " " + (this.Kpormin + ((this.Kpormax - this.Kpormin)) * this.Kpor[p]));
                        }
                        let color = this._getRGB(this.colormap(this.Kpormin + ((this.Kpormax - this.Kpormin)) * this.Kpor[p]));
                        //console.log(color);
                        //colors.push(Math.random(), Math.random(), Math.random(), 1);
                        colors.push(color.red, color.green, color.blue, 1);
                    } else {
                        colors.push(Math.random(), Math.random(), Math.random(), 1);
                    }
                }
            }            
            ribbon.setVerticesData(VertexBuffer.ColorKind, colors);

           /* var colors = ribbon.getVerticesData(VertexBuffer.ColorKind);           
            if(!colors) {
                colors = [];            
                var positions = ribbon.getVerticesData(VertexBuffer.PositionKind);
            
                for(var p = 0; p < positions.length / 3; p++) {
                    colors.push(Math.random(), Math.random(), Math.random(), 1);
                }
            }            
            ribbon.setVerticesData(VertexBuffer.ColorKind, colors);*/


           this.showAxis(10, this.scene);

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
        //var dynamicTexture = new DynamicTexture("DynamicTexture", 50, scene, true);
        var dynamicTexture = new DynamicTexture("DynamicTexture", {width:size * 120, height:size * 60}, scene, true);
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
    	var xChar = this.makeTextPlane("X " + size, "red", size / 10, scene);
    	xChar.position = new Vector3(0.9 * size, -0.05 * size, 0);
    	var axisY = Mesh.CreateLines("axisY", [
        	new Vector3.Zero(), new Vector3(0, size, 0), new Vector3( -0.05 * size, size * 0.95, 0), 
        	new Vector3(0, size, 0), new Vector3( 0.05 * size, size * 0.95, 0)
        ], scene);
    	axisY.color = new Color3(0, 1, 0);
    	var yChar = this.makeTextPlane("Y " + (size), "green", size / 10, scene);
    	yChar.position = new Vector3(0, 0.9 * size, -0.05 * size);
    	var axisZ = Mesh.CreateLines("axisZ", [
        	new Vector3.Zero(), new Vector3(0, 0, size), new Vector3( 0 , -0.05 * size, size * 0.95),
        	new Vector3(0, 0, size), new Vector3( 0, 0.05 * size, size * 0.95)
        ], scene);
    	axisZ.color = new Color3(0, 0, 1);
    	var zChar = this.makeTextPlane("Z " + (size), "blue", size / 10, scene);
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
            lines.color = this.vColor;
            this.existingVWells.push(lines);
            if(name.length != 0) {
                lines.textDyn = this.makeTextPlane(name, "black", 1.5, this.scene, true);
                lines.textDyn.position = points[0];
            }
        });
    }

    buildHorizontalWells(wellsNArray, wellsDArray, wellsParoc, num) {        
        let wn = (wellsNArray != undefined) ? wellsNArray : this.wellsNArray;
        if(num == null || num == 1) {
            wn.forEach(points => {
                let name = (points.well.num) ? points.well.num : ""
                var lines = MeshBuilder.CreateLines(name, {points: points, updatable: true}, this.scene);  
                lines.color = this.nColor;
                this.existingNWells.push(lines);
                if(name.length != 0) {
                    lines.textDyn = this.makeTextPlane(name.replace("Segment-",""), "white", 1, this.scene);
                    lines.textDyn.position = points[0];
                }
            });  
        }
        
        let wd = (wellsDArray != undefined) ? wellsDArray : this.wellsDArray;
        if(num == null || num == 2) {
            wd.forEach(points => {
                let name = (points.well.num) ? points.well.num : ""
                var lines = MeshBuilder.CreateLines(name, {points: points, updatable: true}, this.scene);  
                lines.color = this.dColor;
                this.existingDWells.push(lines);
                if(name.length != 0) {
                    lines.textDyn = this.makeTextPlane(name.replace("Segment-",""), "white", 1, this.scene);
                    lines.textDyn.position = points[0];
                }
            }); 
        }

        let wp = (wellsParoc != undefined) ? wellsParoc : this.wellsParoc;
        if(num == null || num == 3) {
            wp.forEach(points => {
                let name = (points.well.num) ? points.well.num : ""
                var lines = MeshBuilder.CreateLines(name, {points: points, updatable: true}, this.scene);  
                lines.color = this.pColor;
                this.existingPWells.push(lines);
                if(name.length != 0) {
                    lines.textDyn = this.makeTextPlane(name.replace("Segment-",""), "white", 1, this.scene);
                    lines.textDyn.position = points[0];
                }
            }); 
        }
    }   

    clearVWells() {
        this.clearMeshByArray(this.existingVWells);            
    }

    clearDWells() {
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

    clearWellByNameAndArrya(name, array, field) {
        array.forEach(function(item, index, object) {
            if(item[field] == name) {
                item.textDyn.dispose();
                item.dispose();
                object.splice(index, 1);
            }            
        });     
    }

    showWellByNameAndArray(name, array, field, color, existObjArray) {
        array.forEach(points => {
            if(name == points.well[field]) {
                var lines = MeshBuilder.CreateLines(name, {points: points, updatable: true}, this.scene);  
                lines.color = color;
                existObjArray.push(lines);
                if(name.length != 0) {
                    lines.textDyn = this.makeTextPlane(name.replace("Segment-",""), "white", 1, this.scene);
                    lines.textDyn.position = points[0];
                }
            }
        }); 
    }


    clearShowWellByName(ptype, name, show) {
            switch(ptype) {
                case 'v' : {
                    if(!show)
                        this.clearWellByNameAndArrya(name, this.existingVWells, "name");
                    else 
                        this.showWellByNameAndArray(name, this.vertWells, "Well", this.vColor, this.existingVWells);
                    break;
                };
                case 'n': {
                    if(!show)
                        this.clearWellByNameAndArrya(name, this.existingNWells, "name");
                    else 
                        this.showWellByNameAndArray(name, this.wellsNArray, "num", this.nColor, this.existingNWells);   
                    break;
                };
                case 'd': {
                    if(!show)
                        this.clearWellByNameAndArrya(name, this.existingDWells, "name");
                    else 
                        this.showWellByNameAndArray(name, this.wellsDArray, "num", this.dColor, this.existingDWells);
                    break;
                };
                case 'p': {
                    if(!show)
                        this.clearWellByNameAndArrya(name, this.existingPWells, "name");
                    else 
                        this.showWellByNameAndArray(name, this.wellsParoc, "num", this.pColor, this.existingPWells);
                    break;
                };
            }
    }

    focusOn(ptype, name) {
        switch(ptype) {
            case 'v' : {
                this._focusCameraOnVector(this._findVector(name, this.vertWells, "Well"));
                break;
            };
            case 'n': {
                this._focusCameraOnVector(this._findVector(name, this.wellsNArray, "num"));
                break;
            };
            case 'd': {
                this._focusCameraOnVector(this._findVector(name, this.wellsDArray, "num"));
                break;
            };
            case 'p': {
                this._focusCameraOnVector(this._findVector(name, this.wellsParoc, "num"));
                break;
            };
        }
    }
    _focusCameraOnVector (vector) {
        var speed = 60;
        var frameCount = 200;
        console.log(vector);        
        console.log(this.camera);   
        //this.camera.setPosition(new BABYLON.Vector3(x,y,z));
        //this.camera.target = vector;
        //this.camera.radius = 3;
        /*
         animateCameraTargetToPosition(camera, speed, frameCount, new BABYLON.Vector3(.001, 5, .001));
        animateCameraToPosition(camera, speed, frameCount, new BABYLON.Vector3(0, -85, 0));*/
        this._animateCameraTargetToPosition(this.camera, speed, frameCount, vector);
        this._animateCameraToPosition(this.camera, speed, frameCount, new Vector3(vector.x, vector.y, vector.z - 10));
    }

    _animateCameraTargetToPosition (cam, speed, frameCount, newPos) {
        var ease = new CubicEase();
        ease.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
        Animation.CreateAndStartAnimation('at5', cam, 'target', speed, frameCount, cam.target, newPos, 0, ease);
    }

    _animateCameraToPosition(cam, speed, frameCount, newPos) {
       /* var ease = new BABYLON.CubicEase();
        ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
        BABYLON.Animation.CreateAndStartAnimation('at4', cam, 'position', speed, frameCount, cam.position, newPos, 0, ease);*/
    }

    _animateCameraToPosition (cam, speed, frameCount, newPos) {
        var ease = new CubicEase();
        ease.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
        Animation.CreateAndStartAnimation('at4', cam, 'position', speed, frameCount, cam.position, newPos, 0, ease);
    }

    _findVector(name, array, field) {
        let v;
        array.some(function(item) {
            if(item.well[field] == name) {
                v = item;
                return true;
            }
            return false;
        });
        return v[0];
    }

    _getRGB(str){
        var match = str.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/);
        return match ? {
          red: match[1]/256,
          green: match[2]/256,
          blue: match[3]/256
        } : {};
      }
    
}

 //Oil3d;
export { _Oil3d as Oil3d };