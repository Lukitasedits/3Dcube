import * as THREE from "three";
import * as TWEEN from '@tweenjs/tween.js';
import { Piece } from "./piece";


class Cube {
    constructor(factor){
        this.factor = factor;

        //var gltfLoader = new GLTFLoader();

        var group = new THREE.Group();
        var axis = new THREE.Group();
        var available = true;
        group.add(axis);
        axis.position.set(this.factor-1, this.factor-1, this.factor-1);
        //axis.position.set((this.factor-1), (this.factor-1)/2, (this.factor-1)/2);
        /*  function rotateX(){
            requestAnimationFrame(animate);
            axis.rotation.x += 0.01
            renderer.render(scene, camera);
        } */

        var pieces = []
        var points = [];
        let id = 0;
        for(let i = 0; i < this.factor; i++){
            for (let j = 0; j < this.factor; j++) {
                for (let k = 0; k < this.factor; k++) {
                    if(i == this.factor-1 || j == this.factor-1 || k == this.factor-1 ||
                        i == 0 || j == 0 || k == 0){
                        const piece = new Piece(id++,{x:i, y:j, z:k}, this.factor, axis, group);
                        pieces.push(piece);
                    }
                }
            }
        }


        let sphereMaterial = new THREE.MeshStandardMaterial();
        sphereMaterial.transparent = true;
        sphereMaterial.opacity = 0;
        const sphereGeometry = new THREE.SphereGeometry();
        for(let i = -this.factor; i <= this.factor; i++){
            for (let j = -this.factor; j <= this.factor; j++) {
                for (let k = -this.factor; k <= this.factor; k++) {
                    if(i == -this.factor || j == -this.factor || k == -this.factor ||
                        i == this.factor || j == this.factor || k == this.factor){

                        let direction;
                        if(i%2 == 0 && j%2 != 0 && k%2 != 0){
                           direction = 'x';
                        } else if(i%2 != 0 && j%2 == 0 && k%2 != 0){
                            direction = 'y';
                        } else if(i%2 != 0 && j%2 != 0 && k%2 == 0){
                            direction = 'z';
                        }
                        if(direction){
                            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
                            sphere.scale.set(0.5, 0.5, 0.5);
                            sphere.position.set(i, j, k);
                            sphere.position.addScalar(factor-1);
                            sphere.userData.direction = direction;
                            sphere.userData.level = sphere.position[direction]/2;
                            sphere.userData.type = 'point';
                            points.push(sphere);
                            group.add(sphere);
                        }
                    }
                }
            }
        }

        this.model = group;


        var setNewGeneralPosition = function(movePieces, angle, direction){

            let vecXmat = function(vector, matrix){
                return {
                    x: Number((vector.x * matrix[0][0] + vector.y*matrix[1][0] + vector.z*matrix[2][0]).toFixed(3)),
                    y: Number((vector.x * matrix[0][1] + vector.y*matrix[1][1] + vector.z*matrix[2][1]).toFixed(3)),
                    z: Number((vector.x * matrix[0][2] + vector.y*matrix[1][2] + vector.z*matrix[2][2]).toFixed(3))
                };
            }

            let moveVector = function(vector, matrix){

                vector.x -= (factor-1)/2;
                vector.y -= (factor-1)/2;
                vector.z -= (factor-1)/2;

                vector = vecXmat(vector, matrix);

                vector.x += (factor-1)/2;
                vector.y += (factor-1)/2;
                vector.z += (factor-1)/2;

                return vector;
            }

            const rotPieceX = function(piece, angle){
                const matrix =[
                    [1, 0, 0],
                    [0, Math.cos(angle), -Math.sin(angle)],
                    [0, Math.sin(angle), Math.cos(angle)]
                ];
                const newPosition = moveVector({x: piece.currentPosition.x, y: piece.currentPosition.y, z: piece.currentPosition.z}, matrix);
                piece.setCurrentPosition(newPosition.x, newPosition.y, newPosition.z);
            }

            const rotPieceY = function(piece, angle){
                const matrix =[
                    [Math.cos(angle), 0, Math.sin(angle)],
                    [0, 1, 0],
                    [-Math.sin(angle), 0, Math.cos(angle)]
                ];
                const newPosition = moveVector({x: piece.currentPosition.x, y: piece.currentPosition.y, z: piece.currentPosition.z}, matrix);
                piece.setCurrentPosition(newPosition.x, newPosition.y, newPosition.z);
            }

            const rotPieceZ = function(piece, angle){
                const matrix =[
                    [Math.cos(angle), -Math.sin(angle), 0],
                    [Math.sin(angle), Math.cos(angle), 0],
                    [0, 0, 1]
                ];
                const newPosition = moveVector({x: piece.currentPosition.x, y: piece.currentPosition.y, z: piece.currentPosition.z}, matrix);
                piece.setCurrentPosition(newPosition.x, newPosition.y, newPosition.z);
            }

            movePieces.forEach((p) => {
                switch(direction){
                    case 'x': rotPieceX(p, angle);
                    break;
                    case 'y': rotPieceY(p, angle);
                    break;
                    case 'z': rotPieceZ(p, angle);
                    break;
                };
                p.updatePosition();
            });
        }


        

        
        let rotateAxis = function(direction, level, angle = Math.PI/2, finishCicle = false, lap = 0){
            const clockwise = angle<0;
            level = (level > factor-1)?factor:level;
            available = false;
            let movePieces = pieces.filter(p => p.currentPosition[direction] == level);
            movePieces.forEach(p => {
                p.model.position.set(
                    p.currentPosition.x*2-(factor-1),
                    p.currentPosition.y*2-(factor-1),
                    p.currentPosition.z*2-(factor-1)
                )
                p.attachAxis();
            });
            let totalAngle = axis.rotation[direction] + angle;
            var timer = setInterval(()=>{
                axis.rotation[direction] += clockwise? -0.05:0.05;
                const condition = clockwise?(axis.rotation[direction] <= totalAngle):(axis.rotation[direction] >= totalAngle);
                if(condition){
                    axis.rotation[direction] = totalAngle;
                    if(finishCicle){
                        var lapRot = lap*Math.PI/2
                        movePieces.forEach(p => {
                            var quaternion = new THREE.Quaternion().setFromAxisAngle(
                                new THREE.Vector3((direction == 'x')?1:0, (direction == 'y')?1:0, (direction == 'z')?1:0), lapRot);
                                p.model.applyQuaternion(quaternion);
                                p.unattachAxis();
                                p.model.position.set(
                                p.currentPosition.x/2+(factor-1),
                                p.currentPosition.y/2+(factor-1),
                                p.currentPosition.z/2+(factor-1)
                            )
                        });
                        setNewGeneralPosition(movePieces, -lapRot, direction);
                        axis.rotation[direction] = 0;
                    }
                    available = true;
                    clearInterval(timer);
                }
            }, 10);
        }


        this.setControls = function(scene, camera, orbit){   
            const raycaster = new THREE.Raycaster();
            const clickMouse = new THREE.Vector2();
            var moveMouse = new THREE.Vector2();
            var draggable = new THREE.Object3D();            
            
            // Convierte las coordenadas normalizadas a píxeles
            
            const proyScreenVector =  function(vector){
                var puntoEnPantalla = vector.clone().project(camera);
                var x = (puntoEnPantalla.x + 1) * window.innerWidth / 2;
                var y = (-puntoEnPantalla.y + 1) * window.innerHeight / 2;
                return new THREE.Vector2(x, y);
            }

            var draggedPoint;
            var absolutePoint = new THREE.Vector3();
            const updateAbsolutePoint = function(){
                let globalPosition = new THREE.Vector3();
                draggedPoint.getWorldPosition(globalPosition);
                absolutePoint = globalPosition.clone();
                absolutePoint.addScalar(factor*4);
               /*  const lineGeometry = new THREE.BufferGeometry().setFromPoints([globalPosition, absolutePoint]);
                const lineMaterial = new THREE.LineBasicMaterial( {color:0x0f5211});
                const line = new THREE.Line(lineGeometry, lineMaterial); 
                scene.add(line);  */
            }
            window.addEventListener('mousedown', event => {
                if(available){

                    clickMouse.x = ( event.clientX / window.innerWidth ) *2 - 1;
                    clickMouse.y = - ( event.clientY / window.innerHeight ) *2 + 1;
            
                    raycaster.setFromCamera(clickMouse, camera);

                    var intersectable = []
                    points.forEach(p => intersectable.push(p));
                    pieces.forEach(p => intersectable.push(p.model));
                    const found = raycaster.intersectObjects(intersectable);
                    if(found.length > 0){
                        draggable = found[0].object;
                        if(draggable.userData.type === 'point'){
                            orbit.enableRotate = false;
                            draggedPoint = draggable;

                            updateAbsolutePoint();

                            var globalPoint = new THREE.Vector3();
                            draggedPoint.getWorldPosition(globalPoint);
                        }
                    }
                }
            });

            var modAbsolute;
            window.addEventListener('mousemove', event => {
                if(draggedPoint != null && available){
                    moveMouse = new THREE.Vector2(( event.clientX / window.innerWidth ) *2 - 1, - ( event.clientY / window.innerHeight ) *2 + 1);
                    
                    var vectorRot = draggedPoint.userData.direction;

                    switch(vectorRot){
                        case 'x': {
                            const newModAbsolute = moveMouse.distanceTo(proyScreenVector(absolutePoint));
                            if(modAbsolute < newModAbsolute){
                                rotateAxis('x', draggedPoint.userData.level, 0.05, false);
                            } else {
                                rotateAxis('x', draggedPoint.userData.level, -0.05, false);
                            }
                            modAbsolute = newModAbsolute + 0;
                        }
                        break;
                        case 'y': {
                            const newModAbsolute = moveMouse.distanceTo(proyScreenVector(absolutePoint));
                            if(modAbsolute > newModAbsolute){
                                rotateAxis('y', draggedPoint.userData.level, 0.05, false);
                            } else {
                                rotateAxis('y', draggedPoint.userData.level, -0.05, false);
                            }
                            modAbsolute = newModAbsolute + 0;
                        }
                        break;
                        case 'z': {
                            const newModAbsolute = moveMouse.distanceTo(proyScreenVector(absolutePoint));
                            if(modAbsolute > newModAbsolute){
                                rotateAxis('z', draggedPoint.userData.level, 0.05, false);
                            } else {
                                rotateAxis('z', draggedPoint.userData.level, -0.05, false);
                            }
                            modAbsolute = newModAbsolute + 0;
                        }
                    }
                    //updateAbsolutePoint();
                }
            });

            window.addEventListener('mouseup', event => {
                if(draggedPoint != null){
                    orbit.enableRotate = true;
                    let axisAngle = axis.rotation[draggedPoint.userData.direction] + 0;
                    const clockwise = axisAngle < 0;
                    let nLap = Math[clockwise?'ceil':'floor'](axisAngle/(Math.PI/2));
                    const rest = axisAngle%(Math.PI/2);
                    if(-Math.PI/4 < rest && rest < Math.PI /4){  
                       rotateAxis(draggedPoint.userData.direction, draggedPoint.userData.level, -rest , true, nLap);
                    } else {
                       rotateAxis(draggedPoint.userData.direction, draggedPoint.userData.level, clockwise?((nLap-1)*Math.PI/2-axisAngle):((nLap+1)*Math.PI/2-axisAngle) , true, clockwise?(nLap-1):(nLap+1));
                    }
                    draggedPoint = null;
                    absolutePoint = null;
                } else {
                    const startPosition = camera.position.clone();
                    const endPosition = new THREE.Vector3(factor * 3, factor * 3, factor * 3);
                    const cameraRotation = camera.rotation.clone();

                    const tween = new TWEEN.Tween({pos: startPosition, rot: cameraRotation})
                    .to({pos: endPosition, rot: cameraRotation}, 500)
                    .easing(TWEEN.Easing.Quadratic.Out) // Easing para una transición suave
                    .onUpdate((c) => {
                        camera.position.copy(c.pos);
                        camera.rotation.copy(c.rot);
                        orbit.update();
                    })
                    tween.start();
                    
                }
            });
        }

        this.rotateL = function(){
            rotateAxis('x', false, 0);
        }

        this.rotateLp = function(){
            rotateAxis('x', true, 0);
        }

        this.rotateM = function(){
            rotateAxis('x', true, 1);
        }

        this.rotateMp = function(){
            rotateAxis('x', false, 1);
        }

        this.rotateR = function(){
            rotateAxis('x', true, 2);
        }

        this.rotateRp = function(){
            rotateAxis('x', false, 2);
        }


        this.rotateD = function(){
            rotateAxis('y', false, 0);
        }

        this.rotateDp = function(){
            rotateAxis('y', true, 0);
        }

        this.rotateE = function(){
            rotateAxis('y', true, 1);
        }

        this.rotateEp = function(){
            rotateAxis('y', false, 1);
        }

        this.rotateU = function(){
            rotateAxis('y', true, 2);
        }

        this.rotateUp = function(){
            rotateAxis('y', false, 2);
        }


        this.rotateF = function(){
            rotateAxis('z', false, 0);
        }

        this.rotateFp = function(){
            rotateAxis('z', true, 0);
        }

        this.rotateS = function(){
            rotateAxis('z', true, 1);
        }

        this.rotateSp = function(){
            rotateAxis('z', false, 1);
        }

        this.rotateB = function(){
            rotateAxis('z', true, 2);
        }

        this.rotateBp = function(){
            rotateAxis('z', false, 2);
        }

        var me = this;
        window.addEventListener('keydown', function(event) {
            if(available){
                switch(event.key){
                    case '1': me.rotateL()
                    break;
                    case 'q': me.rotateLp()
                    break;
                    case '2': me.rotateM()
                    break;
                    case 'w': me.rotateMp()
                    break;
                    case '3': me.rotateR()
                    break;
                    case 'e': me.rotateRp()
                    break;
                    case '4': me.rotateF()
                    break;
                    case 'r': me.rotateFp()
                    break;
                    case '5': me.rotateS()
                    break;
                    case 't': me.rotateSp()
                    break;
                    case '6': me.rotateB()
                    break;
                    case 'y': me.rotateBp()
                    break;
                    case '7': me.rotateD()
                    break;
                    case 'u': me.rotateDp()
                    break;
                    case '8': me.rotateE()
                    break;
                    case 'i': me.rotateEp()
                    break;
                    case '9': me.rotateU()
                    break;
                    case 'o': me.rotateUp()
                    break;
                    case ' ': defineControlPoints();
                    break;
                }
            }
          })


    }
}
export{Cube}