import Experience from "../Experience";
import * as THREE from "three"
import Environment from "./Environment";
import Mew from "./Mew";
import Island from "./Island";
import Desert from "./Desert";
import Labels from "./Labels";
import Tunnel from '../../Transition/tunnel';

export default class World {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.tunnel = new Tunnel()

        // Wait for resources
        this.resources.on('ready', () => {
            // Setup
            this.island = new Island()
            this.mew = new Mew()
            this.environment = new Environment()

            this.labels = new Labels()
        })

    }

    update() {
        if(this.mew) {
            this.mew.update()
        }
        if(this.labels) {
            this.labels.update()
        }
        // if(this.overlay) {
        //     this.overlay.update()
        // }
    }

    buildDesert() {
        this.tunnel.trigger()
        this.desert = new Desert()
    }
}