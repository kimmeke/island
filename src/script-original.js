import './style.css'
// import Experience from './Experience/Experience'

// const experience = new Experience(document.querySelector('canvas.webgl'))


import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import {gsap} from 'gsap'
import CANNON from 'cannon' 
import { DoubleSide, Raycaster } from 'three'
import { InteractionManager } from "three.interactive";


import vertexShader from './shaders/grass/vertex.glsl'
import fragmentShader from './shaders/grass/fragment.glsl'

console.log('This work is based on "Fantasy_Island" (https://sketchfab.com/3d-models/fantasy-island-88765d3c5db349e59c39cf9f592eba17) by Omar Faruq Tawsif (https://sketchfab.com/omarfaruqtawsif32) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)')
console.log('"Mew 1.0" (https://skfb.ly/6YyLJ) by DreamNoms is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).');

let camera;
let renderer
/**
 * Loaders
 */
 let sceneReady = false
 const loadingBarElement = document.querySelector('.loading-bar')
 const loadingManager = new THREE.LoadingManager(
     // Loaded
     () =>
     {
        // Wait a little
        window.setTimeout(() =>
        {
            gsap.set('.loading-overlay', {autoAlpha: 0})
            // Animate overlay
            gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0, delay: 1 })

            // Update loadingBarElement
            loadingBarElement.classList.add('ended')
            loadingBarElement.style.transform = ''

            gsap.to(character.position, {x: camera.position.x - 14, y: camera.position.y - 20, z: camera.position.z - 10, duration: 4, onComplete: () => {
                const oldAction = actions.current
                const newAction = actions['idle']
                if(oldAction !== newAction) {
                    newAction.reset()
                    newAction.play()
                    newAction.crossFadeFrom(oldAction, 0.5)
                
                    actions.current = newAction
                }

                gsap.to('.speechbubble', {autoAlpha: 1, delay: 0.5})
                gsap.to('.button--start', {scale: 1, delay: 1.5})
            }})
            gsap.to(character.rotation, {y: .8, x: -.8, z: .8, duration: 4})
        }, 500)

        window.setTimeout(() => {

        sceneReady = true

        }, 3000)
     },
 
     // Progress
     (itemUrl, itemsLoaded, itemsTotal) =>
     {
         // Calculate the progress and update the loadingBarElement
         const progressRatio = itemsLoaded / itemsTotal
         loadingBarElement.style.transform = `scaleX(${progressRatio})`
     }
 )
 const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager)

// Canvas
const canvas = document.querySelector('canvas.webgl')


/**
 * Sizes
 */
 const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

/**
 * Renderer
 */
renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ReinhardToneMapping
renderer.toneMappingExposure = 3
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Scene
const scene = new THREE.Scene()
scene.fog = new THREE.Fog( 0x000000, 150, 400 );

/**
 * Camera
 */
// Base camera
camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 1000)
// // camera lookAt wolf position
scene.add( camera );

camera.position.set(120,100,100);
camera.near = 0.1
camera.far = 1000
camera.lookAt(scene.position);	

// Controls

const controls = new OrbitControls(camera, canvas)
controls.autoRotate = false
controls.enableDamping = true
// controls.target = new THREE.Vector3(50,60,50)
controls.target = new THREE.Vector3(camera.position.x - 1, camera.position.y - 0.85, camera.position.z - .9)
controls.enablePan = false
controls.enableZoom = false
controls.rotateSpeed = 0.2
controls.rotateSpeed *= -1;

let childrenScene

/**
 * Base
 */
// Debug
const debugObject = {}
const gui = new dat.GUI()
//Hide gui
gui.hide()


/**
 * Overlay
 */
 const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1)
 const overlayMaterial = new THREE.ShaderMaterial({
     // wireframe: true,
     transparent: true,
     uniforms:
     {
         uAlpha: { value: 1 }
     },
     vertexShader: `
         void main()
         {
             gl_Position = vec4(position, 1.0);
         }
     `,
     fragmentShader: `
         uniform float uAlpha;
 
         void main()
         {
             gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
         }
     `
 })
 const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)
 scene.add(overlay)


/**
 * Update all materials
 */
const updateAllMaterials = () =>
{
    scene.traverse((child) =>
    {
        if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
        {
            // child.material.envMap = environmentMap
            child.material.envMapIntensity = debugObject.envMapIntensity
            child.material.needsUpdate = true
            child.castShadow = true
            child.receiveShadow = true
        }
    })
}

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader(loadingManager)

/**
 * Models
 */
const dracoLoader = new DRACOLoader(loadingManager)
dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader(loadingManager)
gltfLoader.setDRACOLoader(dracoLoader)

const island = new THREE.Group()
island.name = 'Island'
island.position.set(0, -10, 0)
island.rotation.y = -10
scene.add(island)

gltfLoader.load(
    '/models/fantasy_island/gltf/scene.gltf',
    (gltf) => {
        // console.log('gltf:::::', gltf.scene.children[0].children[0].children[0].children);
        // childrenScene = gltf.scene.children[0].children[0].children[0];

        island.add(gltf.scene)

        updateAllMaterials()
    }
)

/**
 * Load character
 */

 const character = new THREE.Group()
 character.name = 'Character'
 character.position.set(60, 40, 0)
 scene.add(character)
 
 let mixer = null
 let actions = {}
 gltfLoader.load(
     '/models/mew/scene.gltf',
     (gltf) => {
 
 
         childrenScene = gltf.scene.children[0].children[0].children[0];
 
         console.log('CHARACTER: ', gltf);
         mixer = new THREE.AnimationMixer(gltf.scene)
 
         actions.idle = mixer.clipAction(gltf.animations[1])
         actions.fly = mixer.clipAction(gltf.animations[3])
         
         actions.current = actions.fly
         actions.current.play()
 
 
         const children = [...childrenScene.children]
         for(const child of children)
         {
             if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
             {
                 // ...
 
                 child.receiveShadow = true
                 child.castShadow = true
             }
             child.position.set(0, 0, 0)
             child.rotation.y = 0.1
             child.scale.set(1.5,1.5, 1.5)
             character.add(child)

             
             child.addEventListener("click", (event) => {
                 console.log('clicked on character');
             });
             
         }
 
 
     }
 )

/**
 * Points of interes
 */
 const raycaster = new Raycaster()
 const points = [
     {
        position: new THREE.Vector3(-70, 30, 65),
        element: document.querySelector('.point-0')
     },
     {
        position: new THREE.Vector3(0, 0.5, 65),
        element: document.querySelector('.point-1')
     },
     {
        position: new THREE.Vector3(4, 62, 2),
        element: document.querySelector('.point-2')
     },
     {
        position: new THREE.Vector3(character.position.x - 20, character.position.y - 5, character.position.z +10),
        element: document.querySelector('.point-mew')
     }
 ]
 const speechbubbles = [
     {
        position: new THREE.Vector3(character.position.x - 30, character.position.y + 20, character.position.z +40),
        element: document.querySelector('.speechbubble')
     },
 ]
 

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 1)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024*4, 1024*4)
directionalLight.shadow.camera.far = 70
directionalLight.shadow.camera.left = - 35
directionalLight.shadow.camera.top = 20
directionalLight.shadow.camera.right = 35
directionalLight.shadow.camera.bottom = - 20
directionalLight.position.set(20, 20, 20)
scene.add(directionalLight)

// const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
// scene.add(directionalLightCameraHelper)

debugObject.clearColor = '#95c4d0'
renderer.setClearColor(debugObject.clearColor)
gui.addColor(debugObject, 'clearColor')
    .onChange(() => {
        renderer.setClearColor(debugObject.clearColor)
    })

    // -72,45,93
// EVENTS
document.querySelector('.point-0').addEventListener('click', () => {
    // point 0 position: -70, 30, 65
    // controls.enabled = false
    // gsap.to(camera.position, {
    //     x: -70, 
    //     y: 61, 
    //     z: 91, 
    //     duration: 3,
    //     onUpdate: () => {
    //         camera.lookAt( -70,41,65 );
    //     },
    //     onComplete: () => {
    //         controls.enabled = true;
    //         controls.target.set( -70,41,65 );
    //     }
    // })
    gsap.set('.overlay-information__content--01', {display: 'block'})
    gsap.to('.overlay-information-container', {autoAlpha: 1, pointerEvents: 'all'})

}, false);

document.querySelector('.point-1').addEventListener('click', () => {
    // point 1 position: 0, 0.5, 65
    // controls.enabled = false
    // gsap.to(camera.position, {
    //     x: 7.5, 
    //     y: 5.6, 
    //     z: 89, 
    //     duration: 3,
    //     onUpdate: () => {
    //         camera.lookAt( -1,0.5,65 );
    //     },
    //     onComplete: () => {
    //         controls.enabled = true;
    //         controls.target.set( -1,0.5,65 );
    //     }
    // })

    gsap.set('.overlay-information__content--02', {display: 'block'})
    gsap.to('.overlay-information-container', {autoAlpha: 1, pointerEvents: 'all'})

}, false);

document.querySelector('.point-2').addEventListener('click', () => {
    // point 2 position: 4, 62, 2
    // controls.enabled = false
    // gsap.to(camera.position, {
    //     x: 17.5,
    //     y: 63,
    //     z: 24,
    //     duration: 3,
    //     onUpdate: () => {
    //         camera.lookAt( 2, 58, 2 );
    //     },
    //     onComplete: () => {
    //         controls.enabled = true;
    //         controls.target.set( 2, 58, 2 );
    //     }
    // })
    gsap.set('.overlay-information__content--03', {display: 'block'})
    gsap.to('.overlay-information-container', {autoAlpha: 1, pointerEvents: 'all'})

}, false);

document.querySelector('.point-mew').addEventListener('click', () => {
    console.log('mew needs to say something');
    gsap.set('.overlay-information__content--go-to-dessert', {display: 'block'})
    gsap.to('.overlay-information-container', {autoAlpha: 1, pointerEvents: 'all'})
}, false);

document.querySelector('.overlay-information__cross-icon').addEventListener('click', () => {
    console.log('clicked');
    gsap.to('.overlay-information-container' , {autoAlpha: 0, pointerEvents: 'none', onComplete: () => {
        gsap.set('.overlay-information__content', {display: 'none'})
    }})
}, false);

console.log(camera);

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0
let moveDistance

const tick = () =>
{
    controls.update();

    var delta = clock.getDelta(); // seconds.
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime
    moveDistance = 3 * delta; // 100 pixels per second

    // Update mixer
    if(mixer) {
        mixer.update(deltaTime)
    }

    if(sceneReady) {
        // Go through each point
        for(const point of points) {
            const screenPosition = point.position.clone()
            screenPosition.project(camera)
    
            raycaster.setFromCamera(screenPosition, camera)
            const intersects = raycaster.intersectObjects(scene.children, true)
    
            if(intersects.length === 0) {
                point.element.classList.add('visible')
            } else {
                const intersectionDistance = intersects[0].distance
                const pointDistance = point.position.distanceTo(camera.position)
    
                if(intersectionDistance < pointDistance) {
                    point.element.classList.remove('visible')
                } else {
                    point.element.classList.add('visible')
                }
            }
    
            const translateX = screenPosition.x * sizes.width * 0.5
            const translateY = - screenPosition.y * sizes.height * 0.5
            point.element.style.transform = `translate(${translateX}px, ${translateY}px)`
        }

        // Go through each speechbubble
        for(const speechbubble of speechbubbles) {
            const screenPosition = speechbubble.position.clone()
            screenPosition.project(camera)
    
            raycaster.setFromCamera(screenPosition, camera)
            const intersects = raycaster.intersectObjects(scene.children, true)
    
            if(intersects.length === 0) {
                speechbubble.element.classList.add('visible')
            } else {
                const intersectionDistance = intersects[0].distance
                const pointDistance = speechbubble.position.distanceTo(camera.position)
    
                if(intersectionDistance < pointDistance) {
                    speechbubble.element.classList.remove('visible')
                } else {
                    speechbubble.element.classList.add('visible')
                }
            }
    
            const translateX = screenPosition.x * sizes.width * 0.5
            const translateY = - screenPosition.y * sizes.height * 0.5
            speechbubble.element.style.transform = `translate(${translateX}px, ${translateY}px)`
        }
    }

    // Render
    renderer.render(scene, camera)
    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()


function playAnimation(val) {
    const oldAction = actions.current
    const newAction = actions[val]
    if(oldAction !== newAction) {
        newAction.reset()
        newAction.play()
        newAction.crossFadeFrom(oldAction, 0.5)
    
        actions.current = newAction
    }
}

document.querySelector('.button--start').addEventListener('click', () => {
    gsap.to(document.querySelector('.chatbox'), {autoAlpha: 0, onComplete: (e) => {
        document.querySelector('.chatbox').style.display = 'none'
    }})
    gsap.to(character.rotation, {x: 0, y: 3, z: 0, duration: 0.8})
    gsap.to(character.rotation, {x: -0.5, y: 3, z: -0.5, duration: 0.6, delay: 1})
    gsap.to(character.position, {x: 40, y: 20, z: 0, duration: 4, delay: 1.2, onStart: () => {
        playAnimation('fly')
    }, onComplete: () => {
        playAnimation('idle')
    }})

    gsap.to(character.rotation, {x: 0, y: 0, z: 0, duration: 1, delay: 4.5, onComplete: () => {
        gsap.to('.label', {scale: 1})
    }})
})


document.querySelector('#go-to-dessert').addEventListener('click', () => {
    console.log('go to dessert function is triggered');
    gsap.to('.overlay-information-container' , {autoAlpha: 0, pointerEvents: 'none', onComplete: () => {
        gsap.set('.overlay-information__content', {display: 'none'})
    }})
    gsap.to('.point', {autoAlpha: 0})
    // Animate overlay
    gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 1, value: 1 })
})