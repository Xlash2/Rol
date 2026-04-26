import { Scalar } from "@babylonjs/core/Maths/math.scalar";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { PhysicsBody } from "@babylonjs/core/Physics/v2/physicsBody";
import {
  PhysicsShapeSphere,
  type PhysicsShape,
} from "@babylonjs/core/Physics/v2/physicsShape";
import type { ContentManager } from "./ContentManager";
import type { SceneManager } from "./SceneManager";

export class EnemyManager {
  private sceneManager: SceneManager;
  private contentManager: ContentManager;

  private speed: number = 2.7;
  private pooledEnemies: TransformNode[] = [];
  private activeEnemies: TransformNode[] = [];

  private shape: PhysicsShape;

  constructor(sceneManager: SceneManager, contentManager: ContentManager) {
    this.sceneManager = sceneManager;
    this.contentManager = contentManager;

    this.shape = new PhysicsShapeSphere(
      new Vector3(0, this.contentManager.entityScale / 2, 0),
      this.contentManager.entityScale / 2,
      this.sceneManager.scene,
    );
    this.shape.isTrigger = true;

    for (let i = 0; i < 6; i++) {
      const enemy = this.contentManager.instantiateEntity("enemy");
      enemy.metadata = { isActive: false, observer: null };
      enemy.setEnabled(false);
      this.pooledEnemies.push(enemy);
    }
  }

  public spawn() {
    if (this.pooledEnemies.length === 0) return;

    const enemy = this.pooledEnemies.pop()!;
    this.activeEnemies.push(enemy);

    let before = this.sceneManager.getRandomChild();
    let after = this.sceneManager.getRandomChild();

    enemy.position.copyFrom(before.position);
    enemy.scaling.scaleInPlace(0);
    enemy.setEnabled(true);

    const body = new PhysicsBody(enemy, 1, true, this.sceneManager.scene);
    this.sceneManager.scene.beginAnimation(
      enemy,
      0,
      this.contentManager.animFps,
      false,
      1 / 2,
      () => {
        body.shape = this.shape;
        enemy.metadata.isActive = true;
      },
    );

    let timer = 0;
    let travelTime =
      Vector3.Distance(before.position, after.position) / this.speed;

    const observer = this.sceneManager.scene.onBeforePhysicsObservable.add(
      () => {
        if (enemy.metadata.isActive)
          timer += this.sceneManager.scene.getEngine().getDeltaTime() / 1000;

        if (timer >= travelTime) {
          before = after;
          after = this.sceneManager.getRandomChild();

          travelTime =
            Vector3.Distance(before.position, after.position) / this.speed;
          timer = 0;
        }

        const alpha = Scalar.InverseLerp(0, travelTime, timer);

        const currentPosition = Vector3.Lerp(
          before.getAbsolutePosition(),
          after.getAbsolutePosition(),
          alpha,
        );

        body.setTargetTransform(
          currentPosition,
          this.sceneManager.deviceRotation,
        );
      },
    );

    enemy.metadata.observer = observer;
  }

  public clear() {
    this.activeEnemies.forEach((enemy) => {
      this.sceneManager.scene.beginAnimation(
        enemy,
        this.contentManager.animFps,
        0,
        false,
        1 / 0.2,
        () => {
          enemy.setEnabled(false);
          enemy.physicsBody?.dispose();
          enemy.metadata.isActive = false;
          this.sceneManager.scene.onBeforePhysicsObservable.remove(
            enemy.metadata.observer,
          );

          this.pooledEnemies.push(enemy);
        },
      );
    });

    this.activeEnemies = [];
  }
}
