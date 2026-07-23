"use client";

import type { InstancedMesh, Vector3 } from "three";
import { useEffect, useRef } from "react";

/* ────────────────────────────────────────────
   Earth3D — Three.js WebGPU sci-fi globe
   Ported from the TSL sci-fi Earth project.
   Supports dynamic parameter updates.
   ──────────────────────────────────────────── */

export interface GlobeParams {
  landColor?: string;
  landPoints?: number;
  landDotSize?: number;
  landFalloff?: number;
  landCoreBoost?: number;
  landSizeVar?: number;
  landBrightVar?: number;
  
  borderColor?: string;
  borderDotSize?: number;
  borderFalloff?: number;
  borderCoreBoost?: number;
  
  shieldColor?: string;
  shieldOpacity?: number;
  shieldHexScale?: number;
  shieldHexOpacity?: number;
  
  twinkleIntensity?: number;
  twinkleSpeed?: number;
}

const DEFAULT_PARAMS: Required<GlobeParams> = {
  landColor: "#6d96cc",
  landPoints: 30000,
  landDotSize: 0.033,
  landFalloff: 2.95,
  landCoreBoost: 1.45,
  landSizeVar: 0.48,
  landBrightVar: 0.13,
  
  borderColor: "#00dfff",
  borderDotSize: 0.024,
  borderFalloff: 3.2,
  borderCoreBoost: 3.0,
  
  shieldColor: "#689ee5",
  shieldOpacity: 0.93,
  shieldHexScale: 12.0,
  shieldHexOpacity: 0.14,
  
  twinkleIntensity: 2.0,
  twinkleSpeed: 3.2,
};

async function initGlobe(
  canvas: HTMLCanvasElement, 
  initialParams: GlobeParams,
  updateRef: { current?: (params: GlobeParams) => void },
  signal: AbortSignal
) {
  const THREE = await import("three/webgpu");
  const TSL = await import("three/tsl");
  const { OrbitControls } = await import("three/addons/controls/OrbitControls.js");
  const { bloom } = await import("three/examples/jsm/tsl/display/BloomNode.js");
  const gsap = (await import("gsap")).default;
  type FlyLine = {
    mesh: any;
    geom: any;
    mat: any;
    progressU: any;
    flowTimeU: any;
    postFadeU: any;
    arrived: boolean;
    tween: ReturnType<typeof gsap.to> | null;
  };

  if (signal.aborted) return;

  const {
    float, fract, instanceIndex, length: tslLength, normalView, positionGeometry,
    positionLocal, positionViewDirection, pow, saturate, sin, cos, smoothstep,
    time, uniform, uv, vec2, vec3, vec4, pass, Fn, step, mix, mx_noise_float,
    max, min, abs, clamp, floor, dot, attribute, cameraPosition, cross,
    modelWorldMatrix, modelWorldMatrixInverse, normalize
  } = TSL;

  const currentParams = { ...DEFAULT_PARAMS, ...initialParams };

  const container = canvas.parentElement!;
  const getSize = () => ({
    width: container.clientWidth,
    height: container.clientHeight,
  });

  const renderer = new THREE.WebGPURenderer({ canvas, forceWebGL: false, antialias: true });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.27;

  const scene = new THREE.Scene();
  const sizes = getSize();
  const frustum = 1.2;
  const aspect = sizes.width / sizes.height;
  const camera = new THREE.OrthographicCamera(-frustum * aspect, frustum * aspect, frustum, -frustum, 0.1, 100);
  camera.position.set(6, 3, 10);
  scene.add(camera);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.enableZoom = false;
  controls.enablePan = false;

  const ambientLight = new THREE.AmbientLight(0x8844ff, 0.1);
  scene.add(ambientLight);
  scene.environmentIntensity = 0.7;

  async function loadMask(url: string) {
    const img = new Image();
    img.src = url;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext("2d", { willReadFrequently: true })!;
    ctx.drawImage(img, 0, 0);
    const { data } = ctx.getImageData(0, 0, c.width, c.height);
    return { data, width: c.width, height: c.height };
  }

  function sampleMask(mask: any, u: number, v: number, threshold: number) {
    const x = Math.min(mask.width - 1, Math.max(0, Math.floor(u * mask.width)));
    const y = Math.min(mask.height - 1, Math.max(0, Math.floor(v * mask.height)));
    const idx = (y * mask.width + x) * 4;
    const lum = (mask.data[idx] + mask.data[idx + 1] + mask.data[idx + 2]) / (3 * 255);
    return lum < threshold;
  }

  function getFibPositions(mask: any, n: number, threshold: number) {
    const goldenRatio = (Math.sqrt(5) + 1) / 2;
    const positions: number[][] = [];
    for (let i = 0; i < n; i++) {
      const prog = i / n;
      const theta = (2 * Math.PI * i) / goldenRatio;
      const phi = Math.acos(1 - 2 * prog);
      const sx = Math.sin(phi) * Math.cos(theta);
      const sy = Math.sin(phi) * Math.sin(theta);
      const sz = Math.cos(phi);
      const gx = sy, gy = sz, gz = sx;
      const lon = Math.atan2(gx, gz);
      const lat = Math.asin(gy);
      const u = lon / (2 * Math.PI) + 0.5;
      const v = 0.5 - lat / Math.PI;
      if (sampleMask(mask, u, v, threshold)) {
        positions.push([gx, gy, gz]);
      }
    }
    return positions;
  }

  function setMatrices(mesh: InstancedMesh, positions: number[][]) {
    const matrix = new THREE.Matrix4();
    const quat = new THREE.Quaternion(), scale = new THREE.Vector3(1, 1, 1), pos = new THREE.Vector3(), normal = new THREE.Vector3(), zAxis = new THREE.Vector3(0, 0, 1);
    for (let i = 0; i < positions.length; i++) {
      const [x, y, z] = positions[i];
      pos.set(x, y, z);
      normal.copy(pos).normalize();
      quat.setFromUnitVectors(zAxis, normal);
      matrix.compose(pos, quat, scale);
      mesh.setMatrixAt(i, matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }

  /* ─── Uniforms definition ───────────────────── */
  const landColorU = uniform(new THREE.Color(currentParams.landColor));
  const landFalloffU = uniform(currentParams.landFalloff);
  const landCoreBoostU = uniform(currentParams.landCoreBoost);
  const landSizeVarU = uniform(currentParams.landSizeVar);
  const landBrightVarU = uniform(currentParams.landBrightVar);

  const borderColorU = uniform(new THREE.Color(currentParams.borderColor));
  const borderFalloffU = uniform(currentParams.borderFalloff);
  const borderCoreBoostU = uniform(currentParams.borderCoreBoost);

  const shieldColorU = uniform(new THREE.Color(currentParams.shieldColor));
  const shieldOpacityU = uniform(currentParams.shieldOpacity);
  const shieldHexScaleU = uniform(currentParams.shieldHexScale);
  const shieldHexOpacityU = uniform(currentParams.shieldHexOpacity);

  const twinkleIntU = uniform(currentParams.twinkleIntensity);
  const twinkleSpdU = uniform(currentParams.twinkleSpeed);

  updateRef.current = (params: GlobeParams) => {
    if (params.landColor) landColorU.value.set(params.landColor);
    if (params.landFalloff !== undefined) landFalloffU.value = params.landFalloff;
    if (params.landCoreBoost !== undefined) landCoreBoostU.value = params.landCoreBoost;
    if (params.landSizeVar !== undefined) landSizeVarU.value = params.landSizeVar;
    if (params.landBrightVar !== undefined) landBrightVarU.value = params.landBrightVar;
    
    if (params.borderColor) borderColorU.value.set(params.borderColor);
    if (params.borderFalloff !== undefined) borderFalloffU.value = params.borderFalloff;
    if (params.borderCoreBoost !== undefined) borderCoreBoostU.value = params.borderCoreBoost;
    
    if (params.shieldColor) shieldColorU.value.set(params.shieldColor);
    if (params.shieldOpacity !== undefined) shieldOpacityU.value = params.shieldOpacity;
    if (params.shieldHexScale !== undefined) shieldHexScaleU.value = params.shieldHexScale;
    if (params.shieldHexOpacity !== undefined) shieldHexOpacityU.value = params.shieldHexOpacity;
    
    if (params.twinkleIntensity !== undefined) twinkleIntU.value = params.twinkleIntensity;
    if (params.twinkleSpeed !== undefined) twinkleSpdU.value = params.twinkleSpeed;
  };

  function createDotMaterial(isLand: boolean) {
    const colorU = isLand ? landColorU : borderColorU;
    const falloffU = isLand ? landFalloffU : borderFalloffU;
    const coreBoostU = isLand ? landCoreBoostU : borderCoreBoostU;
    const sizeVarU = isLand ? landSizeVarU : uniform(0.35);
    const brightVarU = isLand ? landBrightVarU : uniform(0.25);

    const idxF = instanceIndex.toFloat();
    const hashSize = fract(sin(idxF.mul(12.9898)).mul(43758.5453));
    const hashBright = fract(sin(idxF.mul(78.233)).mul(43758.5453));
    const hashTwinkle = fract(sin(idxF.mul(19.1919)).mul(43758.5453));

    const sizeFactor = float(1).add(hashSize.sub(0.5).mul(2).mul(sizeVarU));
    const brightFactor = float(1).add(hashBright.sub(0.5).mul(2).mul(brightVarU));

    const uvCentered = uv().sub(vec2(0.5));
    const d = saturate(tslLength(uvCentered).mul(2));
    const radial = pow(float(1).sub(d), falloffU);
    const core = pow(float(1).sub(d), falloffU.mul(3));
    const softDisk = saturate(radial.add(core.mul(coreBoostU)));

    const facing = saturate(normalView.dot(positionViewDirection));
    const edgeMask = smoothstep(float(0.13), float(0.305), facing);
    const disk = softDisk.mul(edgeMask);

    const material = new THREE.MeshLambertNodeMaterial();
    material.side = THREE.DoubleSide; material.transparent = true; material.depthWrite = false;
    material.positionNode = positionGeometry.mul(sizeFactor);

    const baseTerm = colorU.mul(disk).mul(brightFactor);
    const twinklePhase = hashTwinkle.mul(float(Math.PI * 2));
    const twinkleWave = sin(time.mul(twinkleSpdU).add(twinklePhase)).mul(0.5).add(0.5);
    const twinkleSparkle = pow(saturate(twinkleWave), float(2.6));
    const twinkleMul = float(1).add(twinkleSparkle.mul(twinkleIntU));

    const baseTwinkled = baseTerm.mul(twinkleMul);
    material.colorNode = baseTwinkled;
    material.opacityNode = disk;
    (material as any).emissiveNode = baseTwinkled;
    return material;
  }

  const [landMask, borderMask] = await Promise.all([loadMask("/texture/earth.jpg"), loadMask("/texture/boundary.jpg")]);
  if (signal.aborted) return;

  const landPositions = getFibPositions(landMask, currentParams.landPoints, 1.0);
  const landMat = createDotMaterial(true);
  const landDots = new THREE.InstancedMesh(new THREE.PlaneGeometry(currentParams.landDotSize, currentParams.landDotSize), landMat, landPositions.length);
  setMatrices(landDots, landPositions);
  scene.add(landDots);

  const borderPositions = getFibPositions(borderMask, 80000, 0.18);
  const borderMat = createDotMaterial(false);
  const borderDots = new THREE.InstancedMesh(new THREE.PlaneGeometry(currentParams.borderDotSize, currentParams.borderDotSize), borderMat, borderPositions.length);
  setMatrices(borderDots, borderPositions);
  scene.add(borderDots);

  const innerSphere = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), new THREE.MeshPhysicalNodeMaterial({
    colorNode: uniform(new THREE.Color("#0f1a32")),
    roughnessNode: float(0.2), metalnessNode: float(0.0), clearcoatNode: float(1.0), clearcoatRoughnessNode: float(0.0)
  }));
  scene.add(innerSphere);

  const HEX_S4 = vec4(1.0, 1.7320508, 1.0, 1.7320508);
  const hexEdge = Fn(([p, w]: [any, any]) => {
    const q = vec4(p.x, p.y, p.x.sub(0.5), p.y.sub(1.0));
    const hC = floor(q.div(HEX_S4)).add(0.5);
    const h = vec4(p.sub(hC.xy.mul(vec2(1.0, 1.7320508))), p.sub(hC.zw.add(0.5).mul(vec2(1.0, 1.7320508))));
    const useA = step(dot(h.xy, h.xy), dot(h.zw, h.zw));
    const cell = abs(mix(h.zw, h.xy, useA));
    const dd = max(dot(cell, vec2(0.5, 0.8660254)), cell.x);
    return smoothstep(float(0.5).sub(w), float(0.5), dd);
  });

  const shieldTimeU = uniform(0);
  const shieldGeom = new THREE.SphereGeometry(1.02, 64, 48);
  const shieldMat = new THREE.MeshBasicNodeMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.FrontSide });

  const ndv = normalView.dot(positionViewDirection).saturate();
  const fresnel = pow(ndv.oneMinus(), float(1.0)).mul(float(0.35).add(float(0.25).mul(cos(shieldTimeU.mul(2.0)))));
  const flowT = shieldTimeU.mul(1.5);
  const flowNoise = mx_noise_float(positionLocal.mul(4.0).add(vec3(flowT, flowT.mul(0.6), flowT.mul(0.4))))
    .mul(0.6).add(mx_noise_float(positionLocal.mul(8.4).add(vec3(flowT.mul(-0.5), flowT.mul(0.9), flowT.mul(0.3)))).mul(0.4)).mul(0.5).add(0.5);

  const absN = abs(positionLocal);
  const scaledUV = positionLocal.yz.mul(step(max(absN.y, absN.z), absN.x))
    .add(positionLocal.xz.mul(step(absN.z, absN.y).mul(step(max(absN.y, absN.z), absN.x).oneMinus())))
    .add(positionLocal.xy.mul(step(max(absN.y, absN.z), absN.x).add(step(absN.z, absN.y).mul(step(max(absN.y, absN.z), absN.x).oneMinus())).oneMinus()))
    .mul(shieldHexScaleU);
  
  const hex = hexEdge(scaledUV, float(0.06)).mul(smoothstep(float(0.65), float(0.85), max(absN.x, max(absN.y, absN.z))));
  const intensity = hex.mul(shieldHexOpacityU).mul(fresnel.mul(0.7).add(0.3)).add(fresnel.mul(0.4));
  shieldMat.colorNode = shieldColorU.mul(intensity).mul(2.0).add(shieldColorU.mul(flowNoise).mul(fresnel).mul(4.0));
  shieldMat.opacityNode = clamp(intensity, 0.0, 1.0).mul(smoothstep(float(-1.0), float(0.17), positionLocal.y)).mul(shieldOpacityU);
  
  const shieldMesh = new THREE.Mesh(shieldGeom, shieldMat);
  scene.add(shieldMesh);

  const flyLines: FlyLine[] = [];
  function addFlyLine(aW: Vector3, bW: Vector3, lineColor: string) {
    const progressU = uniform(0), flowTimeU = uniform(0), postFadeU = uniform(1), colorU = uniform(new THREE.Color(lineColor));
    const geom = buildRibbon(aW, bW, 0.18, THREE);
    const mat = new THREE.MeshBasicNodeMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide });
    const lineDirW = (attribute("direction", "vec3") as any).transformDirection(modelWorldMatrix).normalize();
    const pW = modelWorldMatrix.mul(vec4(positionLocal, 1.0)).xyz;
    const toCam = cameraPosition.sub(pW).normalize();
    const rawC = cross(lineDirW, toCam);
    const alt = tslLength(cross(lineDirW, vec3(0,1,0))).greaterThan(float(1e-4)).select(normalize(cross(lineDirW, vec3(0,1,0))), normalize(cross(lineDirW, vec3(1,0,0))));
    const tangentW = tslLength(rawC).greaterThan(float(1e-4)).select(normalize(rawC), alt);
    mat.positionNode = modelWorldMatrixInverse.mul(vec4(pW.add(tangentW.mul(uv().y).mul(uniform(0.005))), 1.0)).xyz;
    const u0 = uv().x, vAbs = abs(uv().y);
    const lateralMask = float(1).sub(smoothstep(float(0.55), float(0.95), vAbs));
    const grown = float(1).sub(smoothstep(progressU.sub(uniform(0.05)), progressU, u0));
    const flowMask = smoothstep(uniform(0.15), float(0), fract(fract(flowTimeU.mul(uniform(2.0))).sub(u0)));
    const a0 = grown.mul(postFadeU).add(smoothstep(0.98, 1.0, progressU).mul(flowMask)).mul(lateralMask);
    const colorNode = colorU as any;
    mat.colorNode = colorNode.add(vec3(1,1,1).sub(colorNode).mul(float(1).sub(smoothstep(float(0),float(0.55),vAbs)).pow(3).mul(uniform(1.35)))).mul(a0).mul(uniform(0.9));
    mat.opacityNode = a0;
    const mesh = new THREE.Mesh(geom, mat); scene.add(mesh);
    const fl: FlyLine = { mesh, geom, mat, progressU, flowTimeU, postFadeU, arrived: false, tween: null };
    flyLines.push(fl); return fl;
  }

  function buildRibbon(aUnit: Vector3, bUnit: Vector3, arcHeight: number, THREE_INST: any) {
    const a = aUnit.clone().normalize(), b = bUnit.clone().normalize();
    const omega = Math.acos(THREE_INST.MathUtils.clamp(a.dot(b), -1, 1));
    const sinO = Math.sin(omega) || 1;
    const pts: Vector3[] = [];
    for (let i = 0; i < 64; i++) {
      const t = i / 63;
      pts.push(new THREE_INST.Vector3().addScaledVector(a, Math.sin((1-t)*omega)/sinO).addScaledVector(b, Math.sin(t*omega)/sinO).multiplyScalar(1 + arcHeight*Math.sin(Math.PI*t)));
    }
    const pos = new Float32Array(64*2*3), dir = new Float32Array(64*2*3), uvs = new Float32Array(64*2*2), indices: number[] = [];
    for (let i = 0; i < 64; i++) {
      const p = pts[i], bi = i*2;
      pos.set([p.x, p.y, p.z], bi*3); pos.set([p.x, p.y, p.z], (bi+1)*3);
      const dV = i<63 ? pts[i+1].clone().sub(pts[i]) : pts[i].clone().sub(pts[i-1]);
      dir.set([dV.x, dV.y, dV.z], bi*3); dir.set([dV.x, dV.y, dV.z], (bi+1)*3);
      uvs.set([i/63, 1], bi*2); uvs.set([i/63, -1], (bi+1)*2);
      if (i<63) indices.push(bi, bi+1, bi+2, bi+1, bi+3, bi+2);
    }
    const geom = new THREE_INST.BufferGeometry();
    geom.setAttribute("position", new THREE_INST.BufferAttribute(pos, 3));
    geom.setAttribute("direction", new THREE_INST.BufferAttribute(dir, 3));
    geom.setAttribute("uv", new THREE_INST.BufferAttribute(uvs, 2));
    geom.setIndex(indices); geom.computeBoundingSphere();
    return geom;
  }

  function lngLatToVec3(lng: number, lat: number, THREE_INST: any) {
    const phi = THREE_INST.MathUtils.degToRad(90 - lat), theta = THREE_INST.MathUtils.degToRad(lng);
    return new THREE_INST.Vector3(Math.sin(phi)*Math.sin(theta), Math.cos(phi), Math.sin(phi)*Math.cos(theta));
  }

  const hub = lngLatToVec3(116.4, 39.9, THREE);
  const targets = [{ lng: -74, lat: 40.7 }, { lng: -0.1, lat: 51.5 }, { lng: 139.7, lat: 35.7 }, { lng: -122.4, lat: 37.8 }, { lng: 151.2, lat: -33.9 }, { lng: 2.35, lat: 48.86 }, { lng: 13.4, lat: 52.52 }, { lng: 55.27, lat: 25.2 }, { lng: 28, lat: -26.2 }, { lng: 103.8, lat: 1.35 }, { lng: -46.6, lat: -23.5 }, { lng: -99.1, lat: 19.4 }, { lng: 72.8, lat: 19.08 }];
  targets.forEach((t, i) => setTimeout(() => {
    if (signal.aborted) return;
    const fl = addFlyLine(hub.clone(), lngLatToVec3(t.lng, t.lat, THREE), "#4e87df");
    fl.tween = gsap.to(fl.progressU, { value: 1, duration: 0.8, ease: "power2.out", onComplete: () => { fl.arrived = true; gsap.to(fl.postFadeU, { value: 0.3, duration: 0.4 }); } });
  }, i * 250));

  const output = vec4(pass(scene, camera).getTextureNode("output").add(bloom(pass(scene, camera).getTextureNode("output"), 0.62, 0.55, 0.2)).rgb.mul(float(1).sub(smoothstep(uniform(0.45), uniform(0.95), tslLength(uv().sub(vec2(0.5)))).mul(uniform(0.48)))), pass(scene, camera).getTextureNode("output").a);
  const renderPipeline = new THREE.RenderPipeline(renderer, output);
  await renderer.init();
  if (signal.aborted) { renderer.dispose(); return; }

  function resize() {
    const s = getSize(), a = s.width/s.height;
    camera.left = -frustum*a; camera.right = frustum*a; camera.top = frustum; camera.bottom = -frustum;
    camera.updateProjectionMatrix();
    renderer.setSize(s.width, s.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
  resize(); window.addEventListener("resize", resize);

  let lastTime = 0;
  renderer.setAnimationLoop((timestamp: number) => {
    if (signal.aborted) return;
    const delta = (timestamp - lastTime) / 1000; lastTime = timestamp;
    controls.update(); shieldTimeU.value += delta;
    for (const fl of flyLines) if (fl.arrived) fl.flowTimeU.value += delta;
    renderPipeline.render();
  });

  return () => {
    renderer.setAnimationLoop(null); window.removeEventListener("resize", resize);
    for (const fl of flyLines) { fl.tween?.kill(); scene.remove(fl.mesh); fl.geom.dispose(); fl.mat.dispose(); }
    scene.remove(landDots); scene.remove(borderDots); scene.remove(innerSphere); scene.remove(shieldMesh);
    renderer.dispose();
  };
}

export default function Earth3D({ params = {} }: { params?: GlobeParams }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const updateRef = useRef<(p: GlobeParams) => void>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const controller = new AbortController();
    let cleanup: (() => void) | undefined;
    initGlobe(canvas, params, updateRef, controller.signal).then((fn) => { if (fn) cleanup = fn; });
    return () => { controller.abort(); cleanup?.(); };
  }, []);

  useEffect(() => { if (updateRef.current) updateRef.current(params); }, [params]);

  return (
    <canvas
      ref={canvasRef}
      className="earth-canvas"
      style={{ width: "100%", height: "100%", display: "block", position: "absolute", top: 0, left: 0 }}
    />
  );
}
