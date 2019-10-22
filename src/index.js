import { Oil3d } from "./engine/oil3d";
import { isObject } from "util";

let oi = new Oil3d("renderCanvas");
console.log(oi.name);
oi.buildScene(function() {
    oi.buildVerticalWells();
    oi.buildHorizontalWells();
});

setTimeout(function() {
    oi.clearDWels();
    setTimeout(function() {
        oi.clearVWells();
        setTimeout(function() {
            oi.clearNWells();
        }, 10000);
    }, 10000);
}, 10000);
