import EventEmitter from './EventEmitter'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import {gsap} from 'gsap'

export default class Resources extends EventEmitter {
    constructor(sources) {
        super()
        
        // Options
        this.sources = sources

        // Setup
        this.items = {}
        this.toLoad = this.sources.length
        this.loaded = 0
        this.sceneReady = false

        this.setLoaders()
        this.startLoading()
    }

    setLoaders() {
        this.loaders = {}
        this.loaders.dracoLoader = new DRACOLoader()
        this.loaders.dracoLoader.setDecoderPath('/draco/')

        this.loaders.gltfLoader = new GLTFLoader()
        this.loaders.gltfLoader.setDRACOLoader(this.loaders.dracoLoader)

        this.loaders.textureLoader = new THREE.TextureLoader()
        this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader()
    }

    startLoading() {
        // Load each source
        for(const source of this.sources) {
            if(source.type === 'gltfModel') {
                this.loaders.gltfLoader.load(
                    source.path,
                    (file) => {
                        this.sourceLoaded(source, file)
                    }
                )
            }
            else if(source.type === 'texture') {
                this.loaders.textureLoader.load(
                    source.path,
                    (file) => {
                        this.sourceLoaded(source, file)
                    }
                )
            }
            else if(source.type === 'cubeTexture') {
                this.loaders.cubeTextureLoader.load(
                    source.path,
                    (file) => {
                        this.sourceLoaded(source, file)
                    }
                )
            }
        }
    }

    sourceLoaded(source, file) {
        this.items[source.name] = file
        this.loaded++

        this.loadingBarElement = document.querySelector('.loading-bar')
        const progressRatio = this.loaded / this.toLoad
        this.loadingBarElement.style.transform = `scaleX(${progressRatio})`

        if(this.loaded === this.toLoad) {
            this.trigger('ready')
            this.removeLoadingscreen()
        }
    }

    removeLoadingscreen() {
        console.log('LOADED');
        // Wait a little
        window.setTimeout(() =>
        {

            // hide overlay loadingbar
            gsap.to('.loading-overlay', {autoAlpha: 0, duration: 2, delay: 1, onComplete: () => {
                // this.mew.flyToCamera()
            }})
            // Update loadingBarElement
            this.loadingBarElement.classList.add('ended')
            this.loadingBarElement.style.transform = ''

        }, 500)

        window.setTimeout(() => {

        this.sceneReady = true
        this.trigger('loaded')

        }, 1000)
    }
}