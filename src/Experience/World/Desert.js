import Experience from "../Experience";
import * as THREE from "three"
import Tunnel from '../../Transition/tunnel';

export default class Desert {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug
        this.camera = this.experience.camera
        this.mew = this.experience.world.mew
        this.tunnel = new Tunnel()
        
        // Setup
        this.resource = this.resources.items.desertModel

        this.setModel()

        this.updateCameraPosition()

        this.updateMewPosition()
    }

    setModel() {
        this.model = this.resource.scene
        this.model.position.set(0, 32, 0)
        this.model.scale.set(70,70, 70)
        this.model.rotation.y = -10

        this.model.traverse((child) => {
            if(child instanceof THREE.Mesh) {
                child.material.needsUpdate = true
                child.receiveShadow = true
                child.castShadow = true
            }
        })

        this.scene.add(this.model)

        setTimeout(() => {
            this.tunnel.destroy()
        }, 3000);
    }

    update() {
        
    }

    updateCameraPosition() {
        this.camera.enableControls()
        this.camera.instance.position.set(3, 0, 3)
        this.camera.instance.lookAt(0,-0.2,-0.5)
        this.camera.controls.target = new THREE.Vector3(0,-0.2,0-0.5)
    }

    updateMewPosition() {
        console.log('MEW: ', this.mew);

        this.mew.model.position.set(-12,-12,-12)
        this.mew.model.rotation.y = 0.8
    }

}