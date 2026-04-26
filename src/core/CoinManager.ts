import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { PhysicsBody } from "@babylonjs/core/Physics/v2/physicsBody";
import { PhysicsShapeSphere } from "@babylonjs/core/Physics/v2/physicsShape";
import { ContentManager } from "./ContentManager";
import type { Game } from "./Game.svelte";
import type { SceneManager } from "./SceneManager";

export class CoinManager {
  private sceneManager: SceneManager;
  private contentManager: ContentManager;
  private game: Game;

  private shape: PhysicsShapeSphere;
  private activeCoin: TransformNode;

  constructor(
    sceneManager: SceneManager,
    contentManager: ContentManager,
    game: Game,
  ) {
    this.sceneManager = sceneManager;
    this.contentManager = contentManager;
    this.game = game;

    this.shape = new PhysicsShapeSphere(
      new Vector3(0, this.contentManager.entityScale / 2, 0),
      this.contentManager.entityScale / 2,
      this.sceneManager.scene,
    );
    this.shape.isTrigger = true;

    const coin = this.contentManager.instantiateEntity("coin");
    coin.metadata = { parent: null, isGot: false };
    this.sceneManager.scene.onBeforePhysicsObservable.add(() => {
      coin.physicsBody?.setTargetTransform(
        coin.metadata.parent.getAbsolutePosition(),
        this.sceneManager.deviceRotation,
      );
    });
    coin.setEnabled(false);
    this.activeCoin = coin;
  }

  public spawn() {
    const coin = this.activeCoin;

    const parent = this.sceneManager.getRandomChild();
    coin.position.copyFrom(parent.position);
    coin.scaling.scaleInPlace(0);
    coin.setEnabled(true);

    coin.metadata.parent = parent;
    coin.metadata.isGot = false;

    const body = new PhysicsBody(coin, 1, true, this.sceneManager.scene);
    this.sceneManager.scene.beginAnimation(
      coin,
      0,
      this.contentManager.animFps,
      false,
      1 / 0.4,
      () => {
        body.shape = this.shape;
      },
    );
  }

  public get() {
    const coin = this.activeCoin;

    if (coin.metadata.isGot === true) return;
    coin.metadata.isGot = true;

    this.game.update();
    this.sceneManager.scene.beginAnimation(
      coin,
      this.contentManager.animFps,
      0,
      false,
      1 / 0.2,
      () => {
        coin.setEnabled(false);
        coin.physicsBody?.dispose();

        this.spawn();
      },
    );

    this.contentManager.sfx["coin_get.ogg"].play();
  }
}
