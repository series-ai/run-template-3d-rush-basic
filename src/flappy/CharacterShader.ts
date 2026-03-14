import * as THREE from "three"
import { Component, GameObject, MeshRenderer } from "@series-inc/rundot-3d-engine"

const vertexShader = /* glsl */ `
    #include <fog_pars_vertex>

    varying vec2 vUv;
    varying vec3 vNormalW;
    varying vec3 vWorldPos;
    varying vec3 vViewDir;

    void main() {
        vUv = uv;

        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPos = worldPos.xyz;
        vNormalW = normalize(mat3(modelMatrix) * normal);
        vViewDir = normalize(cameraPosition - worldPos.xyz);

        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;

        #include <fog_vertex>
    }
`

const fragmentShader = /* glsl */ `
    #include <fog_pars_fragment>

    uniform sampler2D baseMap;
    uniform vec3 sunDir;
    uniform vec3 sunColor;
    uniform float sunIntensity;

    uniform vec3 fresnelColor;
    uniform float fresnelPower;
    uniform float fresnelIntensity;

    uniform vec3 ambientColor;
    uniform float ambientIntensity;

    uniform vec3 specColor;
    uniform float specShininess;
    uniform float specIntensity;

    uniform vec3 underLightColor;
    uniform float underLightIntensity;
    uniform float underLightPower;

    uniform vec3 rimLightDir;
    uniform vec3 rimLightColor;
    uniform float rimLightIntensity;

    uniform float time;

    varying vec2 vUv;
    varying vec3 vNormalW;
    varying vec3 vWorldPos;
    varying vec3 vViewDir;

    vec3 linearToSRGB(vec3 c) {
        vec3 lo = c * 12.92;
        vec3 hi = 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055;
        return mix(lo, hi, step(vec3(0.0031308), c));
    }

    void main() {
        vec4 texColor = texture2D(baseMap, vUv);
        vec3 albedo = texColor.rgb;
        vec3 N = normalize(vNormalW);
        vec3 V = normalize(vViewDir);

        float NdotL = max(dot(N, normalize(sunDir)), 0.0);
        float wrap = NdotL * 0.65 + 0.35;
        vec3 diffuse = albedo * sunColor * sunIntensity * wrap;

        vec3 L = normalize(sunDir);
        vec3 H = normalize(L + V);
        float NdotH = max(dot(N, H), 0.0);
        vec3 spec = specColor * pow(NdotH, specShininess) * specIntensity * NdotL;

        float underDot = max(dot(N, vec3(0.0, -1.0, 0.0)), 0.0);
        underDot = pow(underDot, underLightPower);
        float underPulse = 1.0 + 0.1 * sin(time * 1.2 + vWorldPos.z * 1.5);
        vec3 underLight = underLightColor * underDot * underLightIntensity * underPulse;

        float fresnel = pow(1.0 - max(dot(N, V), 0.0), fresnelPower);
        float rimPulse = 1.0 + 0.12 * sin(time * 2.0 + vWorldPos.y * 3.0);
        vec3 rim = fresnelColor * fresnel * fresnelIntensity * rimPulse;

        float rimDot = max(dot(N, normalize(rimLightDir)), 0.0);
        vec3 rimLight = rimLightColor * rimDot * rimLightIntensity;

        vec3 ambient = albedo * ambientColor * ambientIntensity;

        vec3 color = diffuse + spec + underLight + rim + rimLight + ambient;
        gl_FragColor = vec4(linearToSRGB(color), texColor.a);

        #include <fog_fragment>
    }
`

const sharedTimeUniform = { value: 0 }

export interface CharacterShaderOptions {
    fresnelScale?: number
    underLightScale?: number
    rimLightScale?: number
}

export class CharacterShader extends Component {
    preventAutoInstancing = true

    private originalMaterials: Map<THREE.Mesh, THREE.Material | THREE.Material[]> = new Map()
    private fresnelScale: number
    private underLightScale: number
    private rimLightScale: number

    constructor(options?: CharacterShaderOptions) {
        super()
        this.fresnelScale = options?.fresnelScale ?? 1.0
        this.underLightScale = options?.underLightScale ?? 1.0
        this.rimLightScale = options?.rimLightScale ?? 1.0
    }

    protected onCreate(): void {
        const renderers = (this.gameObject as GameObject).getComponentsInChildren(MeshRenderer)
        let remaining = renderers.length
        if (remaining === 0) return

        for (const renderer of renderers) {
            renderer.onLoaded(() => {
                remaining--
                if (remaining === 0) {
                    this.applyShader(this.gameObject)
                }
            })
        }
    }

    private applyShader(obj: THREE.Object3D): void {
        obj.traverse((child) => {
            if (!(child instanceof THREE.Mesh)) return
            if (!child.material) return
            if (this.originalMaterials.has(child)) return

            const origMat = child.material
            const mat = Array.isArray(origMat) ? origMat[0] : origMat
            const meshMat = mat as THREE.MeshStandardMaterial
            const map = meshMat.map
            if (!map) return

            this.originalMaterials.set(child, origMat)

            const charMat = new THREE.ShaderMaterial({
                vertexShader,
                fragmentShader,
                fog: true,
                toneMapped: false,
                uniforms: {
                    ...THREE.UniformsLib.fog,
                    baseMap: { value: map },
                    sunDir: { value: new THREE.Vector3(-0.5, 0.8, 0.4).normalize() },
                    sunColor: { value: new THREE.Color(0.9, 0.95, 1.0) },
                    sunIntensity: { value: 1.2 },
                    fresnelColor: { value: new THREE.Color(1.0, 1.0, 1.0) },
                    fresnelPower: { value: 5.0 },
                    fresnelIntensity: { value: 0.5 * this.fresnelScale },
                    ambientColor: { value: new THREE.Color(0.4, 0.6, 0.75) },
                    ambientIntensity: { value: 0.5 },
                    specColor: { value: new THREE.Color(1.0, 1.0, 1.0) },
                    specShininess: { value: 32.0 },
                    specIntensity: { value: 0.3 },
                    underLightColor: { value: new THREE.Color(0.0, 0.2, 1.0) },
                    underLightIntensity: { value: 0.4 * this.underLightScale },
                    underLightPower: { value: 1.5 },
                    rimLightDir: { value: new THREE.Vector3(0.6, 0.3, -0.8).normalize() },
                    rimLightColor: { value: new THREE.Color(0.5, 0.85, 1.0) },
                    rimLightIntensity: { value: 0.6 * this.rimLightScale },
                    time: sharedTimeUniform,
                },
            })

            child.material = charMat
        })
    }

    public update(_deltaTime: number): void {
        sharedTimeUniform.value = performance.now() * 0.001
    }

    protected onCleanup(): void {
        for (const [mesh, origMat] of this.originalMaterials) {
            if (mesh.material instanceof THREE.ShaderMaterial) {
                mesh.material.dispose()
            }
            mesh.material = origMat
        }
        this.originalMaterials.clear()
    }
}
