import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import {CSS2DObject} from 'three/examples/jsm/renderers/CSS2DRenderer';


//0: Bottom
//1: Top
//2: Back
//3: Front
//4: Left
//5: Right
class Piece {
    
    constructor(id, initPosition, factor, axis, group){
        this.id = id;
        var gltfLoader = new GLTFLoader();

        this.initPosition = initPosition;

        this.currentPosition = {
            x: initPosition.x,
            y: initPosition.y,
            z: initPosition.z
        };

        this.factor = factor;

        const COLOR = {
            YELLOW: 0xdbce14,
            GREEN: 0x2ee605,
            BLUE: 0x032cfc,
            WHITE: 0xffffff,
            ORANGE: 0xed7315,
            RED: 0xfce803
        }

        if(initPosition.x === initPosition.y && initPosition.y === initPosition.z){
            this.type = 'corner';
        } else if(initPosition.x === factor-1 || initPosition.y === factor-1 || initPosition.z === factor-1){
            this.type = 'edge';
        } else {
            this.type = 'center';
        }

       /*  this.paintPiece = function(x, y, z){

            var piece = {
                bottom: null,
                top: null,
                back: null,
                front: null,
                left: null,
                right: null
            };

            if(x == this.factor-1){
                piece.right = COLOR.GREEN;
            }
            if(y == this.factor-1){
                piece.top = COLOR.YELLOW;
            }
            if(z == this.factor-1){
                piece.front = COLOR.RED;
            }
            if(x == 0){
                piece.left = COLOR.BLUE;
            }
            if(y == 0){
                piece.bottom = COLOR.WHITE;
            }
            if(z == 0){
                piece.back = COLOR.ORANGE;
            }

            return piece;
        }

        this.buildPiece = function(){
            var piece = this.paintPiece(this.position.x, this.position.y, this.position.z);
            this.geometry = new THREE.BoxGeometry();
            const colors = [piece.bottom, piece.top, piece.back, piece.front, piece.left, piece.right];
            this.materials  = colors.map(color => new THREE.MeshBasicMaterial({ color: color }));
            let mesh  = new THREE.Mesh(this.geometry, this.materials);

            mesh.position.set(this.position.x, this.position.y, this.position.z)

            return mesh;
        } */

        //this.mesh = this.buildPiece();
        //var mesh = this.model;
        
        this.attachAxis = function(){
            //this.model.removeFromParent();
            axis.add(this.model);
        }

        this.unattachAxis = function(){
            //this.model.removeFromParent();
            group.add(this.model);
        }

       /* this.rotatePoints = function(direction, angle){

            var matrix = new THREE.Matrix4();
            matrix[('makeRotationY')](angle);

            points.forEach(p => {
                console.group()
                console.log({...p.position})
                p.position.applyMatrix4(matrix);
                console.log({...p.position})
                console.groupEnd();
            });
        } */

        this.model = new THREE.Object3D();
        this.model.userData.type = 'piece';

        var me = this;
        gltfLoader.load('./assets/piece.gltf', function(gltf){
            const children = me.model.children;
            me.model = gltf.scene;
            me.model.position.set(initPosition.x*2, initPosition.y*2, initPosition.z*2);
            //definePoints(me.model);
            group.add(me.model);
        });
        
        this.setCurrentPosition = function(x, y, z){
            this.currentPosition.x = x;
            this.currentPosition.y = y;
            this.currentPosition.z = z;
        }

       
        
        //Label
        const p = document.createElement('p');
        p.textContent = id;
        const cPointLabel = new CSS2DObject(p);

        this.enableLabel = function(){
            if(initPosition['x'] == factor-1)
            group.add(cPointLabel);
        }
        cPointLabel.position.set(this.currentPosition.x*2, this.currentPosition.y*2, this.currentPosition.z*2);
        //this.enableLabel();
        this.updatePosition = function(){
            this.model.position.set(this.currentPosition.x*2, this.currentPosition.y*2, this.currentPosition.z*2);
            cPointLabel.position.set(this.currentPosition.x*2, this.currentPosition.y*2, this.currentPosition.z*2);
        }

    }
}
    
export { Piece }