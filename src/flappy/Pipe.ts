import { Component } from "@series-inc/rundot-3d-engine"
import { FlappyGame, GameState } from "./FlappyGame"
import { Spinner } from "./Spinner"
import { CharacterShader } from "./CharacterShader"

import { Prefabs } from "../Prefabs"
import type { PrefabInstance } from "@series-inc/rundot-3d-engine/systems"

export class Pipe extends Component {
    private gapCenterY = 0
    private gapSize = 0
    private topInstance!: PrefabInstance
    private bottomInstance!: PrefabInstance

    constructor(gapCenterY: number, gapSize: number) {
        super()
        this.gapCenterY = gapCenterY
        this.gapSize = gapSize
    }

    protected onCreate(): void {
        this.buildVisual()
    }

    private buildVisual(): void {
        const halfGap = this.gapSize / 2

        this.topInstance = Prefabs.instantiate("saw", this.gameObject)
        const topObj = this.topInstance.gameObject
        topObj.position.set(0, this.gapCenterY + halfGap, 0)
        this.addBladeSpinner(this.topInstance)

        this.bottomInstance = Prefabs.instantiate("saw", this.gameObject)
        const bottomObj = this.bottomInstance.gameObject
        bottomObj.position.set(0, this.gapCenterY - halfGap, 0)
        bottomObj.rotation.x = Math.PI
        this.addBladeSpinner(this.bottomInstance)
    }

    private addBladeSpinner(sawInstance: PrefabInstance): void {
        const armChild = sawInstance.getChildByName("arm")
        if (armChild) {
            armChild.gameObject.addComponent(new CharacterShader())
            const sawChild = armChild.getChildByName("saw")
            if (sawChild) {
                sawChild.gameObject.addComponent(new CharacterShader())
                sawChild.gameObject.addComponent(new Spinner("x"))
            }
        }
    }

    public update(_deltaTime: number): void {
        // Pipes are static — the bird moves through them
    }

    public getZ(): number {
        return this.gameObject.position.z
    }

    public getGapCenterY(): number {
        return this.gapCenterY
    }

    public getGapSize(): number {
        return this.gapSize
    }
}
