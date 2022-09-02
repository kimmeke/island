import Experience from "../Experience";
import * as THREE from "three"
import { DoubleSide, Raycaster } from 'three'
import gsap from "gsap";
import Mew from "./Mew";

export default class Labels {
    constructor() {
        this.experience = new Experience()
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug
        this.camera = this.experience.camera

        this.character = new Mew()
        
        // Debug
        if(this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('labels')
        }
        
        this.setLabels()
        this.setEvents()
    }

    setLabels() {
        /**
         * Points of interes
         */
         this.raycaster = new Raycaster()
         this.points = [
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
                position: new THREE.Vector3(this.character.model.position.x - 20, this.character.model.position.y - 5, this.character.model.position.z +10),
                element: document.querySelector('.point-mew')
             }
         ]
         this.speechbubbles = [
             {
                position: new THREE.Vector3(this.character.model.position.x - 30, this.character.model.position.y + 20, this.character.model.position.z +40),
                element: document.querySelector('.speechbubble')
             },
         ]
    }

    setEvents() {

        document.querySelector('.button--start').addEventListener('click', () => {
            gsap.to(document.querySelector('.chatbox'), {autoAlpha: 0, onComplete: (e) => {
                document.querySelector('.chatbox').style.display = 'none'
            }})
            gsap.to(this.character.model.rotation, {x: 0, y: 3, z: 0, duration: 0.8})
            gsap.to(this.character.model.rotation, {x: -0.5, y: 3, z: -0.5, duration: 0.6, delay: 1})
            gsap.to(this.character.model.position, {x: 40, y: 20, z: 0, duration: 4, delay: 1.2, onStart: () => {
                this.character.playAnimation('fly')
            }, onComplete: () => {
                this.character.playAnimation('idle')
            }})

            gsap.to(this.character.model.rotation, {x: 0, y: 0, z: 0, duration: 1, delay: 4.5, onComplete: () => {
                gsap.to('.label', {scale: 1})
            }})
        })


        document.querySelector('#go-to-dessert').addEventListener('click', () => {
            this.goToDesert()
        })

        // EVENTS
        document.querySelector('.point-0').addEventListener('click', () => {
            gsap.set('.overlay-information__content--01', {display: 'block'})
            gsap.to('.overlay-information-container', {autoAlpha: 1, pointerEvents: 'all'})

        }, false);

        document.querySelector('.point-1').addEventListener('click', () => {

            gsap.set('.overlay-information__content--02', {display: 'block'})
            gsap.to('.overlay-information-container', {autoAlpha: 1, pointerEvents: 'all'})

        }, false);

        document.querySelector('.point-2').addEventListener('click', () => {
            gsap.set('.overlay-information__content--03', {display: 'block'})
            gsap.to('.overlay-information-container', {autoAlpha: 1, pointerEvents: 'all'})

        }, false);

        document.querySelector('.point-mew').addEventListener('click', () => {
            gsap.set('.overlay-information__content--go-to-dessert', {display: 'block'})
            gsap.to('.overlay-information-container', {autoAlpha: 1, pointerEvents: 'all'})
        }, false);

        document.querySelector('.overlay-information__cross-icon').addEventListener('click', () => {
            gsap.to('.overlay-information-container' , {autoAlpha: 0, pointerEvents: 'none', onComplete: () => {
                gsap.set('.overlay-information__content', {display: 'none'})
            }})
        }, false);
    }

    goToDesert() {
        gsap.to('.overlay-information-container' , {autoAlpha: 0, pointerEvents: 'none', onComplete: () => {
            gsap.set('.overlay-information__content', {display: 'none'})
        }})
        gsap.to('.point', {autoAlpha: 0})
        // Animate overlay
        gsap.to('.loading-overlay', { duration: 1, autoAlpha: 1 })
        /* TODO: 
            - Destroy World fountain scene
            - Build new Desert scene
            - When Desert scene is loaded, remove overlay
            - Change overlay to a nice webgl transition
        */
       this.experience.destroyScene('world')
       // for now remove overlay so you can see the original world again
        gsap.to('.loading-overlay', { duration: 1, autoAlpha: 0, delay: 2 })
    }

    update() {
        // Go through each point
        for(const point of this.points) {
            const screenPosition = point.position.clone()
            screenPosition.project(this.camera.instance)
    
            this.raycaster.setFromCamera(screenPosition, this.camera.instance)
            const intersects = this.raycaster.intersectObjects(this.scene.children, true)
    
            if(intersects.length === 0) {
                point.element.classList.add('visible')
            } else {
                const intersectionDistance = intersects[0].distance
                const pointDistance = point.position.distanceTo(this.camera.instance.position)
    
                if(intersectionDistance < pointDistance) {
                    point.element.classList.remove('visible')
                } else {
                    point.element.classList.add('visible')
                }
            }
    
            const translateX = screenPosition.x * this.sizes.width * 0.5
            const translateY = - screenPosition.y * this.sizes.height * 0.5
            point.element.style.transform = `translate(${translateX}px, ${translateY}px)`
        }

        // Go through each speechbubble
        for(const speechbubble of this.speechbubbles) {
            const screenPosition = speechbubble.position.clone()
            screenPosition.project(this.camera.instance)
    
            this.raycaster.setFromCamera(screenPosition, this.camera.instance)
            const intersects = this.raycaster.intersectObjects(this.scene.children, true)
    
            if(intersects.length === 0) {
                speechbubble.element.classList.add('visible')
            } else {
                const intersectionDistance = intersects[0].distance
                const pointDistance = speechbubble.position.distanceTo(this.camera.instance.position)
    
                if(intersectionDistance < pointDistance) {
                    speechbubble.element.classList.remove('visible')
                } else {
                    speechbubble.element.classList.add('visible')
                }
            }
    
            const translateX = screenPosition.x * this.sizes.width * 0.5
            const translateY = - screenPosition.y * this.sizes.height * 0.5
            speechbubble.element.style.transform = `translate(${translateX}px, ${translateY}px)`
        }
    }
}