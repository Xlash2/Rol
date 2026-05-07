import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { PhysicsBody } from "@babylonjs/core/Physics/v2/physicsBody";
import { PhysicsShapeSphere } from "@babylonjs/core/Physics/v2/physicsShape";
import type { ContentManager } from "./ContentManager";
import type { Game } from "./Game.svelte";
import type { SceneManager } from "./SceneManager";

export class PlayerManager {
  private sceneManager: SceneManager;
  private contentManager: ContentManager;
  private game: Game;

  private spawnPosition: Vector3 = new Vector3(0, 5, 0);
  private shape: PhysicsShapeSphere;

  private player: TransformNode;

  constructor(
    sceneManager: SceneManager,
    gameAssetsManager: ContentManager,
    game: Game,
  ) {
    this.sceneManager = sceneManager;
    this.contentManager = gameAssetsManager;
    this.game = game;

    this.shape = new PhysicsShapeSphere(
      new Vector3(0, 0, 0),
      this.contentManager.entityScale / 2,
      this.sceneManager.scene,
    );

    this.player = this.contentManager.instantiateEntity("player");

    this.player.setEnabled(false);
    this.player.position.copyFrom(this.spawnPosition);

    this.sceneManager.scene.onBeforeRenderObservable.add(() => {
      if (this.player.position.y < -5) {
        this.kill(this.player);
      }
    });

    this.player.metadata = { isDying: false };
  }

  public spawn() {
    const player = this.player;

    player.scaling.scaleInPlace(0);
    player.setEnabled(true);

    const body = new PhysicsBody(player, 2, false, this.sceneManager.scene);
    body.shape = this.shape;
    body.setMassProperties({ mass: 1e-3 });
    body.setAngularDamping(0);

    this.sceneManager.scene.beginAnimation(
      player,
      0,
      this.contentManager.animFps,
      false,
      1 / 0.4,
    );

    this.contentManager.sfx["player_spawn.ogg"].play();
  }

  public kill(player: TransformNode) {
    if (player.metadata.isDying) return;
    player.metadata.isDying = true;

    this.sceneManager.scene.beginAnimation(
      player,
      this.contentManager.animFps,
      0,
      false,
      1 / 0.4,
      () => {
        this.game.end();

        player.setEnabled(false);
        player.physicsBody?.dispose();
        player.metadata.isDying = false;

        player.position.copyFrom(this.spawnPosition);
      },
    );

    this.contentManager.sfx["player_die.ogg"].play();
  }
}
