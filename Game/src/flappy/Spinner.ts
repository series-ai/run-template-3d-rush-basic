import { Component } from "@series-inc/rundot-3d-engine"

type Axis = "x" | "y" | "z"

export class Spinner extends Component {
    private axis: Axis
    private speed: number

    constructor(axis: Axis, speed: number = 3) {
        super()
        this.axis = axis
        this.speed = speed
    }

    public update(deltaTime: number): void {
        this.gameObject.rotation[this.axis] += this.speed * deltaTime
    }
}
