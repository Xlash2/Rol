import { Animation as Anim } from "@babylonjs/core/Animations/animation";
import type { AssetContainer } from "@babylonjs/core/assetContainer";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { AssetsManager } from "@babylonjs/core/Misc/assetsManager";
import type { Scene } from "@babylonjs/core/scene";
import { Howl } from "howler";

export class ContentManager {
  public assetsManager: AssetsManager;

  private modelFiles = ["player.glb", "stage.glb", "enemy.glb", "coin.glb"];
  public models: Record<string, AssetContainer> = {};

  private sfxFiles = ["coin_get.ogg", "player_spawn.ogg", "player_die.ogg"];
  public sfx: Record<string, Howl> = {};

  public bgm!: Howl;

  public scaleAnim: Anim;
  public entityScale: number = 0.65;
  public animFps = 120;

  private scene: Scene;

  constructor(scene: Scene) {
    this.assetsManager = new AssetsManager(scene);
    this.assetsManager.autoHideLoadingUI = false;

    this.scene = scene;

    this.modelFiles.forEach((modelFile) => {
      const task = this.assetsManager.addContainerTask(
        modelFile,
        "",
        "./models/",
        modelFile,
      );

      task.onSuccess = (task) => {
        this.models[modelFile] = task.loadedContainer;
      };
    });

    this.scaleAnim = new Anim(
      "scaleAnim",
      "scaling",
      this.animFps,
      Anim.ANIMATIONTYPE_VECTOR3,
      Anim.ANIMATIONLOOPMODE_CONSTANT,
    );

    const keyFrames = [];
    keyFrames.push({
      frame: 0,
      value: new Vector3(0, 0, 0),
    });

    keyFrames.push({
      frame: this.animFps,
      value: new Vector3(1, 1, 1).scaleInPlace(this.entityScale),
    });

    this.scaleAnim.setKeys(keyFrames);
  }

  public loadBgm(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.bgm = new Howl({
        src: ["./sounds/bgm.ogg"],
        loop: true,
        autoplay: true,
        onload: () => resolve(),
        onloaderror: () => reject(),
      });
    });
  }

  public loadSfx(): Promise<void[]> {
    const promises: Promise<void>[] = this.sfxFiles.map((sfxFile) => {
      return new Promise((resolve, reject) => {
        const howl = new Howl({
          src: [`./sounds/${sfxFile}`],
          onload: () => resolve(),
          onloaderror: () => reject(),
        });

        this.sfx[sfxFile] = howl;
      });
    });

    return Promise.all(promises);
  }

  public instantiateEntity(name: string): TransformNode {
    const root = this.models[`${name}.glb`].instantiateModelsToScene();
    const instance = new TransformNode(name, this.scene);
    (root.rootNodes[0] as TransformNode).setParent(instance);

    root.animationGroups.forEach((gp) => {
      gp.play(true);
    });
    instance.animations.push(this.scaleAnim);

    return instance;
  }
}
