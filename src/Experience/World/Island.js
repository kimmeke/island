import Experience from "../Experience";
import * as THREE from "three"

export default class Island {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug
        
        // Setup
        this.resource = this.resources.items.islandModel

        this.setModel()
    }

    setModel() {
        this.model = this.resource.scene
        this.model.position.set(0, -10, 0)
        this.model.rotation.y = -10
        this.scene.add(this.model)

        this.model.traverse((child) => {
            if(child instanceof THREE.Mesh) {
                // child.material.envMapIntensity = debugObject.envMapIntensity
                child.material.needsUpdate = true
                child.receiveShadow = true
                child.castShadow = true
            }
        })
    }

    update() {
        
    }
}