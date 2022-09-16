
import * as THREE from "three"
import gsap from 'gsap'
import Time from "../Experience/Utils/Time"

let instance = null
export default class Island {
    constructor() {
        if(instance) {
            return instance
        }
        instance = this

        this.time = new Time()

        this.ww = window.innerWidth
        this.wh = window.innerHeight;
        this.torusRadius = 200;
        this.torusDiameter = 25;
        this.rings = 180;
        this.detail = 30;

        this.renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector("#canvas-transition"),
        antialias : true
        });
        this.renderer.setSize(this.ww, this.wh);

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x000000, this.torusRadius * 0.8, this.torusRadius * 1.1);

        this.camera2 = new THREE.PerspectiveCamera(60,this.ww / this.wh, 1, this.torusRadius * 1.1);
        this.camera2.position.set(Math.cos(0) * this.torusRadius, 0, Math.sin(0) * this.torusRadius);

        this.light = new THREE.PointLight(0xffffff, 2, 150);
        this.light.position.set(Math.cos(-Math.PI * 0.3) * this.torusRadius, 0, Math.sin(-Math.PI * 0.3) * this.torusRadius);
        this.scene.add(this.light);

        gsap.to(this.light.position, 6, {
        x : Math.cos(Math.PI * 0.3) * this.torusRadius,
        z : Math.sin(Math.PI * 0.3) * this.torusRadius,
        ease: 'Power2.easeInOut',
        repeat:-1,
        yoyo :true
        });

        window.addEventListener("resize", this.handleResize);
        this.mouse = new THREE.Vector2(0,0);

        this.torus = new THREE.Object3D();
        gsap.to(this.torus.rotation, 90,{
        y:  Math.PI * 2,
        ease: 'Linear.easeNone',
        repeat: -1
        });
        this.scene.add(this.torus);



        this.createTorus();


        // window.requestAnimationFrame(() => {
        //     this.tick()
        // })
        // window.requestAnimationFrame(this.render);
    }

    handleResize() {
        this.ww = window.innerWidth;
        this.wh = window.innerHeight;
    
        this.camera2.aspect = this.ww / this.wh;
        this.camera2.updateProjectionMatrix();
    
        this.renderer.setSize(this.ww, this.wh);
    }

    createTorus() {
        this.geometry = new THREE.BoxBufferGeometry(2, 2, 2);
        for (var i = 0; i < this.rings; i++) {
            var u = i / this.rings * Math.PI * 2;
            var ring = new THREE.Object3D();
            ring.position.x = this.torusRadius * Math.cos(u);
            ring.position.z = this.torusRadius * Math.sin(u);
            var colorIndex = Math.round(Math.abs(noise.simplex2(Math.cos(u) * 0.5, Math.sin(u) * 0.5)) * 180);
            var color = new THREE.Color("hsl(" + colorIndex + ",50%,50%)");
            var material = new THREE.MeshLambertMaterial({
            color: color
            });
            for (var j = 0; j < this.detail; j++) {
            var v = j / this.detail * Math.PI * 2;
            var x = this.torusDiameter * Math.cos(v) * Math.cos(u);
            var y = this.torusDiameter * Math.sin(v);
            var z = this.torusDiameter * Math.cos(v) * Math.sin(u);
            var size = (Math.random() * 5) + 0.1;
            var cube = new THREE.Mesh(this.geometry, material);
            cube.scale.set(size, size, size);
            cube.position.set(x, y, z);
            var rotation = (Math.random()-0.5)*Math.PI*4;
            cube.rotation.set(rotation, rotation, rotation);
            ring.add(cube);
            }
            this.torus.add(ring);
        }
    }

    tick() {
        this.camera2.lookAt(this.light.position);
        this.renderer.render(this.scene, this.camera2);
    }

    destroy() {
        console.log('destroy tunnel');
        window.removeEventListener('resize', this.handleResize, false);
        //to remove the listener later...
        this.time.off('tick')
        this.scene.fog.near = 1
        this.scene.fog.far = 1
        gsap.to([this.scene.fog, this.scene.fog], {far: 1, near: 1, duration:0.5, onComplete: () => {
            gsap.to('#canvas-transition', {autoAlpha: 0, duration: 0.8})
        }} )
        this.renderer.render(this.scene, this.camera2);

        // Traverse the whole scene
        this.scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.geometry.dispose();

                for (const key in child.material) {
                    const value = child.material[key];

                    if (value && typeof value.dispose === 'function') {
                        value.dispose();
                    }
                }
            }
        });

        // this.controls.dispose();
        this.renderer.dispose();
    }

    trigger() {
        console.log('tunnel triggered');
        // Time tick event
        gsap.to('#canvas-transition', {autoAlpha: 1, duration: 0.8})
        this.time.on('tick', () => {
            this.tick()
        })
    }
}