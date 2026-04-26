import type { AssetContainer } from "@babylonjs/core/assetContainer";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { GlowLayer } from "@babylonjs/core/Layers/glowLayer";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { PhysicsBody } from "@babylonjs/core/Physics/v2/physicsBody";
import { PhysicsShapeBox } from "@babylonjs/core/Physics/v2/physicsShape";
import { DefaultRenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline";
import type { Scene } from "@babylonjs/core/scene";

export class SceneManager {
  public scene: Scene;
  private assets: Record<string, AssetContainer>;

  public children: TransformNode[] = [];
  public glowLayer: GlowLayer;
  public deviceRotation: Quaternion = Quaternion.Identity();

  constructor(scene: Scene, assets: Record<string, AssetContainer>) {
    // Constructor

    this.scene = scene;
    this.assets = assets;

    // Stage

    const instance = this.assets["stage.glb"].instantiateModelsToScene();
    const stage = new TransformNode("stage", this.scene);
    (instance.rootNodes[0] as TransformNode).setParent(stage);

    const body = new PhysicsBody(stage, 1, false, this.scene);

    const shape = new PhysicsShapeBox(
      new Vector3(0, -0.5, 0),
      Quaternion.Identity(),
      new Vector3(9, 1, 16),
      this.scene,
    );

    body.shape = shape;

    const camera = new ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      0,
      24,
      new Vector3(0, 0, 0),
    );

    const light = new HemisphericLight(
      "light",
      new Vector3(0, 1, 0),
      this.scene,
    );
    light.intensity = 1;

    this.glowLayer = new GlowLayer("glow", scene);
    this.glowLayer.blurKernelSize = 64;
    this.glowLayer.intensity = 1;

    // Post processing

    var defaultPipeline = new DefaultRenderingPipeline(
      "DefaultRenderingPipeline",
      true,
      scene,
      scene.cameras,
    );

    defaultPipeline.imageProcessingEnabled = true;
    defaultPipeline.imageProcessing.vignetteEnabled = true;
    defaultPipeline.imageProcessing.vignetteWeight = 18;

    defaultPipeline.imageProcessing.ditheringEnabled = true;
    defaultPipeline.imageProcessing.ditheringIntensity = 0.05;

    defaultPipeline.imageProcessing.exposure = 1.15;

    for (let x = -4; x <= 4; x++) {
      for (let z = -7; z <= 7; z++) {
        const transform = new TransformNode(`${x}${z}`, this.scene);
        transform.parent = stage;
        transform.position = new Vector3(x, 0, z);
        this.children.push(transform);
      }
    }

    window.addEventListener("deviceorientation", (e) => {
      let degrees = [e.alpha, e.beta, e.gamma];

      let radians = degrees.map((deg) => deg! * (Math.PI / 180));

      const eulerRotation = new Vector3(-radians[1], 0, -radians[2]);
      this.deviceRotation = Quaternion.FromEulerAngles(
        eulerRotation.x,
        eulerRotation.y,
        eulerRotation.z,
      );
    });

    this.scene.onBeforePhysicsObservable.add(() => {
      body.setTargetTransform(Vector3.ZeroReadOnly, this.deviceRotation);
    });
  }

  public getRandomChild(): TransformNode {
    const max = this.children.length - 1;
    const min = 0;
    const i = Math.floor(Math.random() * (max - min)) + min;

    return this.children[i];
  }
}
