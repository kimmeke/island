import Experience from "./Experience";
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'


export default class Camera {
    constructor() {
        this.experience = new Experience()
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.canvas = this.experience.canvas

        this.setInstance()
        this.setOrbitControls()
    }

    setInstance() {
        /**
         * Camera
         */
        // Base camera
        this.instance = new THREE.PerspectiveCamera(45, this.sizes.width / this.sizes.height, 0.1, 1000)
        this.instance.position.set(120,100,100);
        this.instance.lookAt(this.scene.position);
        this.scene.add( this.instance );

    }

    setOrbitControls() {
        // Controls
        this.controls = new OrbitControls(this.instance, this.canvas)
        this.controls.autoRotate = false
        this.controls.enableDamping = true
        this.controls.target = new THREE.Vector3(this.instance.position.x - 1, this.instance.position.y - 0.85, this.instance.position.z - .9)
        this.controls.enablePan = false
        this.controls.enableZoom = false
        this.controls.rotateSpeed = 0.2
        this.controls.rotateSpeed *= -1;
    }
    
    resize() {
        // Update camera
        this.instance.aspect = this.sizes.width / this.sizes.height
        this.instance.updateProjectionMatrix()
    }

    update() {
        this.controls.update()
        // console.log('camera position: ', this.instance.position);
    }

    enableControls() {
        // this.controls.target = new THREE.Vector3(0,0,0)
        this.controls.enablePan = true
        this.controls.enableZoom = true
    }
}