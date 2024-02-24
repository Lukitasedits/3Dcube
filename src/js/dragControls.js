
import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

class DragControls {   
    constructor(scene, radius, vector){

        var gltfLoader = new GLTFLoader();
        
        class CircularCurve extends THREE.Curve {
            constructor(radius) {
                super();
                this.radius = radius; // Radio del círculo
            }
        
            // getPoint es una función necesaria para que la curva se renderice
            getPoint(t, optionalTarget = new THREE.Vector3()) {
                const theta = 2 * Math.PI * t; // Ángulo theta
                const x = this.radius * Math.cos(theta); // Coordenada x
                const y = this.radius * Math.sin(theta); // Coordenada y
                return optionalTarget.set(x, y, 0); // Devuelve el punto en formato Vector3
            }
        }
        
        // Creamos una curva circular con un radio de 5
        const circularCurve = new CircularCurve(5);

        // Creamos un material para el tubo (puedes ajustar los parámetros según tus necesidades)
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

        // Creamos la geometría del tubo
        const geometry = new THREE.TubeGeometry(circularCurve, 64, 0.1, 8, false);

        // Creamos una malla con la geometría y el material
        const tubeMesh = new THREE.Mesh(geometry, material);

        //scene.add(tubeMesh);
    }
}
export{DragControls}