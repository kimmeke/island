import Experience from "../Experience";
import {gsap} from 'gsap'
import * as THREE from "three"

export default class Mew {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug
        this.camera = this.experience.camera

        //Debug
        if(this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('fox')
        }
        
        // Setup
        this.resource = this.resources.items.mewModel

        this.setModel()
        this.setAnimation()
    }

    setModel() {
        this.model = this.resource.scene
        this.model.position.set(60, 40, 0)
        this.model.rotation.y = 0.1
        this.model.scale.set(17,17, 17)
        this.scene.add(this.model)

        this.model.traverse((child) => {
            if(child instanceof THREE.Mesh) {
                child.receiveShadow = true
                child.castShadow = true
            }
        })
    }

    setAnimation() {
        this.animation = {}
        this.animation.mixer = new THREE.AnimationMixer(this.model)

        this.animation.actions = {}

        this.animation.actions.idle = this.animation.mixer.clipAction(this.resource.animations[1])
        this.animation.actions.fly = this.animation.mixer.clipAction(this.resource.animations[3])
        
        this.animation.actions.current = this.animation.actions.idle
        this.animation.actions.current.play()

        this.animation.play = (name) => {
            this.newAction = this.animation.actions[name]
            this.oldAction = this.animation.actions.current

            this.newAction.reset()
            this.newAction.play()
            this.newAction.crossFadeFrom(this.oldAction, 1)

            this.animation.actions.current = this.newAction
        }

        // Debug
        if(this.debug.active) {
            const debugObject = {
                playIdle: () => {
                    this.animation.play('idle')
                },
                playFly: () => {
                    this.animation.play('fly')
                },
            }
            this.debugFolder.add(debugObject, 'playIdle')
            this.debugFolder.add(debugObject, 'playFly')
        }
    }

    update() {
        this.animation.mixer.update(this.time.delta * 0.001)
    }

    flyToCamera() {
        this.animation.play('fly')

        gsap.to(this.model.position, {x: this.camera.instance.position.x - 5, y: this.camera.instance.position.y - 20, z: this.camera.instance.position.z - 5, duration: 4, onComplete: () => {
            this.animation.play('idle')

            gsap.to('.speechbubble', {autoAlpha: 1, delay: 0.5})
            gsap.to('.button--start', {scale: 1, delay: 1.5})
        }})
        gsap.to(this.model.rotation, {y: .8, x: -.8, z: .8, duration: 4})
    }

    playAnimation(val) {

        /* TODO: 
            - Fix play animation mew
        */
        this.animation.play(val)
    }
}