//css
//import {$, jQuery} from "jquery";
//import {$, jQuery} from "jquery";
import easyuicss from './vendor/jquery-easyui-1.8.8/themes/default/easyui.css';
import easyuiicons from './vendor/jquery-easyui-1.8.8/themes/icon.css';
//import jQuery from './vendor/jquery-easyui-1.8.8/jquery.min.js';
import easyui from './vendor/jquery-easyui-1.8.8/jquery.easyui.min.js';

import { Oil3d } from "./engine/oil3d";



let oi = new Oil3d("renderCanvas");
console.log(oi.name);

oi.buildScene(function() {
    oi.buildVerticalWells();
    oi.buildHorizontalWells();

    let treeData = [{   //0
            text: 'Вертикальные скважины',
            id: "vert",
            state: 'closed',
            children: [],
            type:"maint",
            "checked":true
    },{ //1
        text: 'Добывающие скважины',
        id: "dob",
        state: 'closed',
        children: [],
        type:"maint",
        "checked":true
    },{ //2
        text: 'Нагнетательные скважины',
        id: "nagn",
        state: 'closed',
        children: [],
        type:"maint",
        "checked":true
    },{ //3
        text: 'Пароциклические скважины',
        id: "paroc",
        state: 'closed',
        children: [],
        type:"maint",
        "checked":true
    }];    
    //Вертикальные скважины
    oi.vertWells.forEach(element => {        
        let letObj = element.well;
        letObj.text = letObj.Well;
        treeData[0]["children"].push(letObj);
    });
    //
    oi.wellsDArray.forEach(element => {      
        let letObj = element.well;
        letObj.text = letObj.num;
        treeData[1]["children"].push(letObj);
    });

    oi.wellsNArray.forEach(element => { 
        let letObj = element.well;
        letObj.text = letObj.num;
        treeData[2]["children"].push(letObj);
    });

    oi.wellsParoc.forEach(element => { 
        let letObj = element.well;
        letObj.text = letObj.num;
        treeData[3]["children"].push(letObj);
    });


    let t = $('#tree').tree({
        data: treeData,
        onClick: function(node){
            var p = t.tree('getParent', node.target);
            switch(p.id) {
                case "vert": { oi.focusOn("v", node.text); break;}
                case "dob": { oi.focusOn("d", node.text); break;}
                case "nagn": { oi.focusOn("n", node.text); break;}
                case "paroc": { oi.focusOn("p", node.text); break;}
            }    
        },
        onCheck: function(node) {
            console.log(node);
            if(!node.checked) {
                if(node.type == "maint") { //Массовое включение
                    switch(node.id) {
                        case "vert": { oi.clearVWells(); break;}
                        case "dob": { oi.clearDWells(); break;}
                        case "nagn": { oi.clearNWells(); break;}
                        case "paroc": { oi.clearPWells(); break;}
                    }
                } else {        //Поэлементно
                    var p = t.tree('getParent', node.target);
                    switch(p.id) {
                        case "vert": { oi.clearShowWellByName("v", node.text, false); break;}
                        case "dob": { oi.clearShowWellByName("d", node.text, false); break;}
                        case "nagn": { oi.clearShowWellByName("n", node.text, false); break;}
                        case "paroc": { oi.clearShowWellByName("p", node.text, false); break;}
                    }    
                }
            } else {
                if(node.type == "maint") { //Массовое включение
                    switch(node.id) {
                        case "vert": { oi.buildVerticalWells(); break;}
                        case "dob": { oi.buildHorizontalWells(undefined, undefined, undefined, 2); break;}
                        case "nagn": { oi.buildHorizontalWells(undefined, undefined, undefined, 1); break;}
                        case "paroc": { oi.buildHorizontalWells(undefined, undefined, undefined, 3); break;}
                    }
                } else {        //Поэлементно
                    var p = t.tree('getParent', node.target);
                    switch(p.id) {
                        case "vert": { oi.clearShowWellByName("v", node.text, true); break;}
                        case "dob": { oi.clearShowWellByName("d", node.text, true); break;}
                        case "nagn": { oi.clearShowWellByName("n", node.text, true); break;}
                        case "paroc": { oi.clearShowWellByName("p", node.text, true); break;}
                    }                
                }
            }
        }/*,
        onBeforeCheck: function(node) {
            console.log(node);
            alert("onBeforeCheck" + node.text);  
        }*/
    });
});



/*setTimeout(function() {
    oi.clearDWels();
    setTimeout(function() {
        oi.clearVWells();
        setTimeout(function() {
            oi.clearNWells();
        }, 10000);
    }, 10000);
}, 10000);*/
