import type { Color as ChromaColor } from "chroma-js";
import chroma from "chroma-js";
import type { vec3 } from "gl-matrix";
// @ts-ignore
import { N8AOPostPass } from "n8ao";
import {
  EffectComposer,
  EffectPass,
  RenderPass,
  SMAAEffect,
  SMAAPreset,
} from "postprocessing";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { decideVisualParametersBasedOn1DData } from "../utils";
import { computeTubes, decideGeometry } from "./render-utils";
import type { DrawableMarkSegment } from "./renderer-types";

/**
 * A 3D renderer for chromatin structures built on THREE.js with post-processing effects.
 *
 * Provides high-level methods for visualizing chromatin data with features including:
 * - Instanced rendering for performance
 * - Ambient occlusion (SSAO) for depth perception
 * - Anti-aliasing (SMAA)
 * - Interactive hover effects
 * - Orbit camera controls
 *
 * @example
 * const renderer = new ChromatinBasicRenderer({ alwaysRedraw: true, hoverEffect: false });
 * renderer.addSegments(segments);
 * renderer.startDrawing();
 * const canvas = renderer.getCanvasElement();
 * document.body.appendChild(canvas);
 */
export class ChromatinBasicRenderer {
  markSegments: DrawableMarkSegment[] = [];
  //objectsToDispose: THREE.Object3D[] = []; // objects that need to be disposed of when clearing the scene
  objectsToDispose: Array<
    THREE.BufferGeometry | THREE.InstancedMesh | THREE.MeshBasicMaterial
  > = []; // objects that need to be disposed of when clearing the scene

  //~ threejs stuff
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  composer: EffectComposer;
  ssaoPasses: [N8AOPostPass, N8AOPostPass];
  meshes: THREE.InstancedMesh[] = [];

  //~ dom
  redrawRequest = 0;
  updateCallback: ((text: string) => void) | undefined;

  alwaysRedraw = false;
  hoverEffect = false;
  debugView = false;

  //~ interactions
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2(1, 1);
  /* returns a tuple of [segment index, bin index] of hovered bin */
  hoveredBinId: [number, number] | undefined = undefined;

  constructor(params?: {
    canvas?: HTMLCanvasElement;
    alwaysRedraw?: boolean;
    hoverEffect?: boolean;
    ssaoParams?: { radius?: number; intensity?: number; falloff?: number };
  }) {
    const {
      canvas = undefined,
      alwaysRedraw = true,
      hoverEffect = false,
      ssaoParams = {},
    } = params || {};

    const { intensity = 5.0, radius = 0.02, falloff = 2 } = ssaoParams;

    this.renderer = new THREE.WebGLRenderer({
      powerPreference: "high-performance",
      antialias: false,
      stencil: false,
      depth: false,
      alpha: true,
      premultipliedAlpha: false,
      canvas,
    });
    // this.renderer.setClearColor("#00eeee");
    this.renderer.setClearAlpha(0.0);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(25, 2, 0.1, 1000);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.camera.position.z = 3.0;
    this.controls.update();

    const lightA = new THREE.DirectionalLight();
    lightA.position.set(3, 10, 10);
    lightA.castShadow = true;
    const lightB = new THREE.DirectionalLight();
    lightB.position.set(-3, 10, -10);
    lightB.intensity = 0.2;
    const lightC = new THREE.AmbientLight();
    lightC.intensity = 0.2;
    this.scene.add(lightA, lightB, lightC);

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    // N8AOPass replaces RenderPass
    const w = 1920;
    const h = 1080;
    const n8aopass = new N8AOPostPass(this.scene, this.camera, w, h);
    n8aopass;
    n8aopass.configuration.aoRadius = radius;
    n8aopass.configuration.distanceFalloff = falloff;
    n8aopass.configuration.intensity = intensity;
    this.composer.addPass(n8aopass);

    //~ adding a second, coarser SSAO pass
    //~ the parameters are computed from the first pass
    const n8aopassBigger = new N8AOPostPass(this.scene, this.camera, w, h);
    n8aopassBigger.configuration.aoRadius = radius * 10;
    n8aopassBigger.configuration.distanceFalloff = falloff;
    n8aopassBigger.configuration.intensity = 0.6;
    // this.composer.addPass(n8aopassBigger);

    this.ssaoPasses = [n8aopass, n8aopassBigger];

    /* SMAA Recommended */
    this.composer.addPass(
      new EffectPass(
        this.camera,
        new SMAAEffect({
          preset: SMAAPreset.ULTRA,
        }),
      ),
    );

    this.render = this.render.bind(this);
    this.update = this.update.bind(this);
    this.getCanvasElement = this.getCanvasElement.bind(this);
    this.startDrawing = this.startDrawing.bind(this);
    this.endDrawing = this.endDrawing.bind(this);
    this.resizeRendererToDisplaySize =
      this.resizeRendererToDisplaySize.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);

    //~ setting size of canvas to fill parent
    const c = this.getCanvasElement();
    c.style.width = "100%";
    c.style.height = "100%";

    this.hoverEffect = hoverEffect;
    this.alwaysRedraw = alwaysRedraw;
    if (!alwaysRedraw) {
      //~ re-render on mouse move: initially, I had redraw on camera change, but since I'm doing effects on hover, I need to redraw more frequently
      document.addEventListener("wheel", this.render);
      document.addEventListener("mousemove", this.render);
    }
    c.addEventListener("mousemove", this.onMouseMove);
  }

  getCanvasElement(): HTMLCanvasElement {
    return this.renderer.domElement;
  }

  /**
   * Returns a pair [segment id, bin id] to identify hovered bin
   */
  getHoveredBin(): [number, number] | undefined {
    return this.hoveredBinId;
  }

  addUpdateHUDCallback(cb: (text: string) => void) {
    this.updateCallback = cb;
  }

  clearScene() {
    this.scene.clear();
    this.markSegments = [];
    for (const obj of this.objectsToDispose) {
      obj.dispose();
    }
    this.objectsToDispose = [];
    for (const m of this.meshes) {
      m.dispose();
    }
    this.meshes = [];
  }

  /**
   * Entrypoint for adding actual data to show
   */
  addSegments(newSegments: DrawableMarkSegment[]) {
    this.markSegments = [...this.markSegments, ...newSegments];
    this.buildStructures();
  }

  /**
   * Turns all drawable segments into THREE objects to be rendered
   */
  buildStructures() {
    this.scene.clear();
    for (const segment of this.markSegments) {
      this.buildPart(segment);
    }

    if (this.debugView) {
      this.showDebugCube();
    }
  }

  setCameraParams(position: vec3, rotation: vec3) {
    this.camera.position.set(position[0], position[1], position[2]);
    this.camera.rotation.set(rotation[0], rotation[1], rotation[2]);
    this.camera.updateProjectionMatrix();
  }

  getCameraControls(): OrbitControls {
    return this.controls;
  }

  showDebugCube() {
    //~ just something to debug the placement of objects in scene
    const a = 1.0;
    const indicatorGeom = new THREE.BoxGeometry(a, a, a);
    const m = new THREE.MeshBasicMaterial({ color: "#000000" });
    m.wireframe = true;
    const indicator = new THREE.Mesh(indicatorGeom, m);
    indicator.position.set(0, 0, 0);
    this.scene.add(indicator);
  }

  /**
   * Meant to be called directly from client (eg, Observable notebook) to request redraw
   */
  updateViewConfig() {
    this.scene.clear();
    this.buildStructures();
    this.redrawRequest = requestAnimationFrame(this.render);
  }

  /**
   * Turns a singular segment (ie, position+mark+attributes) into THREEjs objects for rendering
   */
  buildPart(segment: DrawableMarkSegment) {
    const {
      color, //TODO: these don't make sense now to be undefined eveer
      // size = undefined,
      makeLinks = true,
    } = segment.attributes;

    const gPos = segment.attributes.position;

    //~ make the threejs objects
    const g = decideGeometry(segment.mark);
    const m = new THREE.MeshBasicMaterial({ color: "#FFFFFF" });
    const n = segment.positions.length;
    const meshInstcedSpheres = new THREE.InstancedMesh(g, m, n);
    const dummyObj = new THREE.Object3D();

    //~ iterating over bins in the current segment
    for (const [i, b] of segment.positions.entries()) {
      const [colorOfThisBin, scaleOfThisBin] =
        decideVisualParametersBasedOn1DData(segment, i);

      dummyObj.position.set(gPos[0] + b[0], gPos[1] + b[1], gPos[2] + b[2]);
      dummyObj.scale.setScalar(scaleOfThisBin);
      dummyObj.updateMatrix();
      meshInstcedSpheres.setMatrixAt(i, dummyObj.matrix);
      meshInstcedSpheres.setColorAt(i, colorOfThisBin);
    }
    this.scene.add(meshInstcedSpheres);
    this.meshes.push(meshInstcedSpheres);

    //~ save stuff for later disposal
    if (g) {
      this.objectsToDispose.push(g);
    }
    this.objectsToDispose.push(meshInstcedSpheres);
    this.objectsToDispose.push(m);

    if (makeLinks) {
      const markSize = segment.attributes.size;
      const tubeScalingFactor = segment.attributes.linksScale;
      this.buildLinks(
        segment.positions,
        markSize,
        tubeScalingFactor,
        color,
        gPos,
      );
    }
  }

  /**
   * Utility function for building links between marks (optional)
   */
  buildLinks(
    positions: vec3[],
    markSize: number | number[],
    tubeScalingFactor: number,
    color: ChromaColor | ChromaColor[],
    partPosition: vec3,
  ) {
    //~ tubes between tubes
    const tubes = computeTubes(positions);
    const tubeGeometry = new THREE.CylinderGeometry(1.0, 1.0, 1.0, 10, 1);
    const material = new THREE.MeshBasicMaterial({ color: "#FFFFFF" });

    const meshInstcedTubes = new THREE.InstancedMesh(
      tubeGeometry,
      material,
      tubes.length,
    );

    const p = partPosition;

    const dummyObj = new THREE.Object3D();
    const colorObj = new THREE.Color();
    for (const [i, tube] of tubes.entries()) {
      dummyObj.position.set(
        tube.position.x + p[0],
        tube.position.y + p[1],
        tube.position.z + p[2],
      );
      dummyObj.rotation.set(
        tube.rotation.x,
        tube.rotation.y,
        tube.rotation.z,
        tube.rotation.order,
      );
      dummyObj.scale.setY(tube.scale); //~ This scales the tube length based on the distance between bins

      if (Array.isArray(markSize)) {
        dummyObj.scale.setX(markSize[i] * tubeScalingFactor);
        dummyObj.scale.setZ(markSize[i] * tubeScalingFactor);
      } else {
        dummyObj.scale.setX(markSize * tubeScalingFactor);
        dummyObj.scale.setZ(markSize * tubeScalingFactor);
      }

      dummyObj.updateMatrix();

      //~ narrowing: ChromaColor or ChromaColor[]
      if (Array.isArray(color)) {
        colorObj.set(color[i].hex());
      } else {
        colorObj.set(color.hex());
      }

      meshInstcedTubes.setMatrixAt(i, dummyObj.matrix);
      meshInstcedTubes.setColorAt(i, colorObj);
    }
    this.scene.add(meshInstcedTubes);

    // for disposal
    this.objectsToDispose.push(tubeGeometry);
    this.objectsToDispose.push(meshInstcedTubes);
    this.objectsToDispose.push(material);
  }

  updateColor(meshIndex: number, color: ChromaColor | ChromaColor[]) {
    const mesh = this.meshes[meshIndex];
    const colorObj = new THREE.Color();

    for (let i = 0; i < mesh.count; i++) {
      //~ narrowing: ChromaColor or ChromaColor[]
      if (Array.isArray(color)) {
        colorObj.set(color[i].hex());
      } else {
        colorObj.set(color.hex());
      }
      mesh.setColorAt(i, colorObj);
      if (mesh.instanceColor) {
        mesh.instanceColor.needsUpdate = true;
      }
    }
  }

  startDrawing() {
    this.redrawRequest = requestAnimationFrame(this.render);
  }

  endDrawing() {
    cancelAnimationFrame(this.redrawRequest);
    this.renderer.dispose();
  }

  resizeRendererToDisplaySize(renderer: THREE.WebGLRenderer): boolean {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width = Math.floor(canvas.clientWidth * pixelRatio);
    const height = Math.floor(canvas.clientHeight * pixelRatio);
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
      this.composer.setSize(width, height);
      const [pass1, pass2] = this.ssaoPasses;
      pass1.setSize(width, height);
      pass2.setSize(width, height);
    }
    return needResize;
  }

  update() {
    this.raycaster.setFromCamera(this.mouse, this.camera);

    this.hoveredBinId = undefined;
    for (const [i, m] of this.meshes.entries()) {
      const intersection = this.raycaster.intersectObject(m);
      if (intersection.length > 0) {
        const instanceId = intersection[0].instanceId;
        if (instanceId) {
          this.hoveredBinId = [i, instanceId];
          if (this.updateCallback) {
            this.updateCallback(`Hovered: part ${i}, bin ${instanceId}`);
          }
        }
      } else {
        if (this.updateCallback) {
          this.updateCallback("");
        }
      }
    }

    //~ color neighboring sequence
    if (this.hoverEffect) {
      if (this.hoveredBinId) {
        const [segmentId, binId] = this.hoveredBinId;
        const segment = this.markSegments[segmentId];

        const min = -50;
        const max = 50;
        const colorScale = chroma.scale(["yellow", "red", "yellow"]);
        const N = segment.positions.length;
        const indices = Array.from({ length: N + 1 }, (_, i) => i - binId);
        const color = indices.map((v) => colorScale.domain([min, max])(v));

        this.updateColor(segmentId, color);
      } else {
        //~ reset all
        for (const [i, s] of this.markSegments.entries()) {
          this.updateColor(i, s.attributes.color);
        }
      }
    }
  }

  render() {
    if (this.alwaysRedraw) {
      this.redrawRequest = requestAnimationFrame(this.render);
    }

    this.update();
    // console.log("hovered bin:" + this.hoveredBinId);

    //~ from: https://threejs.org/manual/#en/responsive
    if (this.resizeRendererToDisplaySize(this.renderer)) {
      const canvas = this.renderer.domElement;
      this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
      this.camera.updateProjectionMatrix();
    }

    this.composer.render();
  }

  onMouseMove(event: MouseEvent) {
    event.preventDefault();
    const canvas = this.renderer.domElement;

    /* deal with canvas that's offset, not fullscreen */
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.x;
    const y = event.clientY - rect.y;

    /* mouse.x/y should be both in <-1,1> */
    this.mouse.x = (x / rect.width) * 2 - 1;
    this.mouse.y = -(y / rect.height) * 2 + 1;
  }
}
