import * as THREE from "three"
import { Component, MeshRenderer } from "@series-inc/rundot-3d-engine"

// Shared GLSL: simplex noise + wind displacement
const noiseGlsl = /* glsl */ `
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
        const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        i = mod289(i);
        vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        vec4 x = x_ * ns.x + ns.yyyy;
        vec4 y = y_ * ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        vec4 s0 = floor(b0) * 2.0 + 1.0;
        vec4 s1 = floor(b1) * 2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
        p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    vec3 seaweedWind(vec3 localPos, float time, float windSpeed, float windStrength, vec3 rootWorld) {

        float t = time * windSpeed;
        float nx = snoise(vec3(rootWorld.x * 0.25, rootWorld.z * 0.25, t * 0.12));
        float nz = snoise(vec3(rootWorld.z * 0.25 + 31.7, rootWorld.x * 0.25 + 17.3, t * 0.09));

        // Scale angle by height — bottom stays put, tip bends most
        float h = smoothstep(0.0, 1.0, localPos.y * 0.5);

        float angleX = nz * windStrength * 0.3 * h;
        float angleZ = nx * windStrength * 0.3 * h;

        float sy = sin(angleZ); float cy = cos(angleZ);
        float sx = sin(angleX); float cx = cos(angleX);

        // Rotate around Z axis (left/right lean)
        vec3 pos = vec3(
            localPos.x * cy - localPos.y * sy,
            localPos.x * sy + localPos.y * cy,
            localPos.z
        );

        // Rotate around X axis (forward/back lean)
        pos = vec3(
            pos.x,
            pos.y * cx - pos.z * sx,
            pos.y * sx + pos.z * cx
        );

        return pos;
    }
`

const seaweedVertexShader = /* glsl */ `
    #include <fog_pars_vertex>

    uniform float time;
    uniform float windStrength;
    uniform float windSpeed;
    uniform vec3 rootWorldOrigin;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPos;

    ${noiseGlsl}

    void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);

        vec3 pos = seaweedWind(position, time, windSpeed, windStrength, rootWorldOrigin);

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
        gl_Position = projectionMatrix * mvPosition;

        #include <fog_vertex>
    }
`

const seaweedFragmentShader = /* glsl */ `
    #include <fog_pars_fragment>

    uniform sampler2D baseMap;
    uniform vec3 tintColor;
    uniform float alphaClip;
    uniform vec3 lightDir;
    uniform vec3 ambientColor;
    uniform float ambientStrength;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPos;

    void main() {
        vec4 texColor = texture2D(baseMap, vUv);
        if (texColor.a < alphaClip) discard;

        vec3 albedo = texColor.rgb * tintColor;

        float NdotL = dot(normalize(vNormal), normalize(lightDir));
        float intensity = NdotL * 0.4 + 0.6;

        vec3 lit = albedo * intensity;
        vec3 ambient = albedo * ambientColor * ambientStrength;

        gl_FragColor = vec4(lit + ambient, texColor.a);

        #include <fog_fragment>
    }
`

const seaweedDepthVertexShader = /* glsl */ `
    uniform float time;
    uniform float windStrength;
    uniform float windSpeed;
    uniform vec3 rootWorldOrigin;

    varying vec2 vUv;

    ${noiseGlsl}

    void main() {
        vUv = uv;

        vec3 pos = seaweedWind(position, time, windSpeed, windStrength, rootWorldOrigin);

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
`

const seaweedDepthFragmentShader = /* glsl */ `
    #include <packing>

    uniform sampler2D baseMap;
    uniform float alphaClip;

    varying vec2 vUv;

    void main() {
        vec4 texColor = texture2D(baseMap, vUv);
        if (texColor.a < alphaClip) discard;

        gl_FragColor = packDepthToRGBA(gl_FragCoord.z);
    }
`

// Shared time — use elapsed time directly instead of accumulating deltaTime
const sharedTimeUniform = { value: 0 }

export class SeaweedShader extends Component {
    preventAutoInstancing = true

    private originalMaterials: Map<THREE.Mesh, THREE.Material | THREE.Material[]> = new Map()
    private materials: THREE.ShaderMaterial[] = []

    protected onCreate(): void {
        const renderer = this.getComponent(MeshRenderer)
            ?? this.gameObject.getComponentInChildren(MeshRenderer)
        if (renderer) {
            renderer.onLoaded(() => this.applyShader(this.gameObject))
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

            const color = meshMat.color ? meshMat.color.clone() : new THREE.Color(1, 1, 1)

            // Capture the plant's world position at spawn time so scrolling doesn't affect noise
            const rootWorld = new THREE.Vector3()
            this.gameObject.getWorldPosition(rootWorld)

            const sharedUniforms = {
                time: sharedTimeUniform,
                windStrength: { value: 0.5 },
                windSpeed: { value: 3.0 },
                rootWorldOrigin: { value: rootWorld },
                baseMap: { value: map },
                alphaClip: { value: 0.5 },
            }

            const seaweedMat = new THREE.ShaderMaterial({
                vertexShader: seaweedVertexShader,
                fragmentShader: seaweedFragmentShader,
                side: THREE.DoubleSide,
                transparent: false,
                toneMapped: false,
                fog: true,
                uniforms: {
                    ...THREE.UniformsLib.fog,
                    ...sharedUniforms,
                    tintColor: { value: color },
                    lightDir: { value: new THREE.Vector3(-0.5, 1.0, 0.4).normalize() },
                    ambientColor: { value: new THREE.Color(0.5, 0.7, 0.8) },
                    ambientStrength: { value: 0.85 },
                },
            })

            const depthMat = new THREE.ShaderMaterial({
                vertexShader: seaweedDepthVertexShader,
                fragmentShader: seaweedDepthFragmentShader,
                side: THREE.DoubleSide,
                uniforms: { ...sharedUniforms },
            })

            child.material = seaweedMat
            child.customDepthMaterial = depthMat
            child.customDistanceMaterial = depthMat

            this.materials.push(seaweedMat, depthMat)
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
            mesh.customDepthMaterial?.dispose()
            mesh.customDistanceMaterial?.dispose()
            mesh.customDepthMaterial = undefined as any
            mesh.customDistanceMaterial = undefined as any
            mesh.material = origMat
        }
        this.originalMaterials.clear()
        this.materials = []
    }
}
