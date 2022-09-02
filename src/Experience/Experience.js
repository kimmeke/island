
import * as THREE from "three"
import Sizes from "./Utils/Sizes"
import Time from "./Utils/Time"
import Camera from "./Camera"
import Renderer from "./Renderer"
import World from "./World/World"
import Resources from "./Utils/Resources"
import sources from "./sources"
import Debug from "./Utils/Debug"

let instance = null

export default class Experience {
    constructor(canvas) {
        if(instance) {
            return instance
        }
        instance = this

        // Global access
        window.experience = this

        // Options
        this.canvas = canvas

        this.currentScene = 'world'

        // Setup
        this.debug = new Debug()
        this.sizes = new Sizes()
        this.time = new Time()
        this.buildScene(this.currentScene)
        
        this.resources = new Resources(sources)
        this.camera = new Camera()
        
        this.renderer = new Renderer()

        this.buildWorld()
        // Sizes resize event
        this.sizes.on('resize', () => {
            this.resize()
        })

        // Time tick event
        this.time.on('tick', () => {
            this.update()
        })

        this.resources.on('loaded', () => {
            this.loaded()
        })
    }
    buildWorld(val) {
        if(this.currentScene === 'world') {
            this.world = new World()
        } else if (this.currentScene === 'desert') {
            // TODO: make Desert world
            // this.desert = new Desert()
        }
    }

    buildScene(val) {
        this.scene = new THREE.Scene()
        this.scene.fog = new THREE.Fog( 0x000000, 150, 400 );
    }

    resize() {
        this.camera.resize()
        this.renderer.resize()
    }
    update() {
        this.camera.update()
        this[this.currentScene].update()
        this.renderer.update()
    }

    loaded() {
        this.world.mew.flyToCamera()
    }

    destroy() {
        this.sizes.off('resize')
        this.time.off('tick')

        // Traverse the whole scene
        this.scene.traverse((child) => {
            if(child instanceof THREE.Mesh) {
                child.geometry.dispose()

                for( const key in child.material ) {
                    const value = child.material[key]

                    if(value && typeof value.dispose === 'function') {
                        value.dispose()
                    }
                }
            }
        })

        this.camera.controls.dispose()
        this.renderer.instance.dispose()
        if(this.debug.active) {
            this.debug.ui.destroy()
        }
    }
    
    destroyScene(val, newVal) {
        console.log('destroyScene: ', val);
        console.log('world: ', this[val].scene);
        console.log("clean up before", this.renderer);

        this.sizes.off('resize')
        this.time.off('tick')
        // Traverse the whole scene
        this[val].scene.traverse((child) => {
            if(child instanceof THREE.Mesh) {
                this[val].scene.remove(child)
                child.geometry.dispose()

                for( const key in child.material ) {
                    const value = child.material[key]

                    if(value && typeof value.dispose === 'function') {
                        value.dispose()
                    }
                }
            }

        })

        this.camera.controls.dispose()
        this.renderer.instance.dispose()
        // new val should be 'desert' for now
        this.buildScene()
        this.buildWorld(newVal)
    }
}