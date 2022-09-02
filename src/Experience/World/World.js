import Experience from "../Experience";
import * as THREE from "three"
import Environment from "./Environment";
import Mew from "./Mew";
import Island from "./Island";
import Labels from "./Labels";

export default class World {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources

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
}