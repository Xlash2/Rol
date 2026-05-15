import HavokPhysics from "@babylonjs/havok";

import { CoinManager } from "./CoinManager";
import { ContentManager } from "./ContentManager";
import { EnemyManager } from "./EnemyManager";
import { PlayerManager } from "./PlayerManager";
import { SceneManager } from "./SceneManager";

import dracoWasmBinary from "@babylonjs/core/assets/Draco/draco_decoder_gltf.wasm?url";
import dracoFallback from "@babylonjs/core/assets/Draco/draco_decoder_gltf?url";
import dracoWasm from "@babylonjs/core/assets/Draco/draco_wasm_wrapper_gltf?url";

import { Engine } from "@babylonjs/core/Engines/engine";
import { DefaultLoadingScreen } from "@babylonjs/core/Loading/loadingScreen";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { DracoDecoder } from "@babylonjs/core/Meshes/Compression/dracoDecoder";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import "@babylonjs/core/Physics/joinedPhysicsEngineComponent";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import { Scene, ScenePerformancePriority } from "@babylonjs/core/scene";
import "@babylonjs/loaders/glTF/2.0";

export class Game {
  private playerManager!: PlayerManager;
  private coinManager!: CoinManager;
  private enemyManager!: EnemyManager;

  private currentEnemyCount = 0;

  public state: GameState = $state(GameState.ASLEEP);
  public score: number = $state(0);
  public highScore: number = $state(
    localStorage.getItem("highScore")
      ? Number.parseInt(localStorage.getItem("highScore")!)
      : 0,
  );
  public fps: string = $state("");

  public async init(): Promise<void> {
    if (this.state !== GameState.ASLEEP) return;

    this.state = GameState.INIT;

    // Setup

    const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

    const engine = new Engine(canvas, true, undefined, true);

    DefaultLoadingScreen.DefaultLogoUrl = "./images/loading.svg";
    DefaultLoadingScreen.DefaultSpinnerUrl = "./images/spinner.svg";

    engine.displayLoadingUI();

    const scene = new Scene(engine);
    scene.performancePriority = ScenePerformancePriority.Intermediate;
    scene.clearColor = Color4.FromHexString("#00000000");

    DracoDecoder.DefaultConfiguration.wasmUrl = dracoWasm;
    DracoDecoder.DefaultConfiguration.wasmBinaryUrl = dracoWasmBinary;
    DracoDecoder.DefaultConfiguration.fallbackUrl = dracoFallback;

    // Events

    window.addEventListener("resize", () => {
      engine.resize();
    });

    document.addEventListener("visibilitychange", () => {
      if (!Howler.ctx) return;

      if (document.hidden && Howler.ctx.state === "running")
        Howler.ctx.suspend();
      else if (Howler.ctx.state === "suspended") Howler.ctx.resume();
    });

    // Physics

    const hkInstance = await HavokPhysics();
    const hkPlugin = new HavokPlugin(true, hkInstance);

    scene.enablePhysics(new Vector3(0, -9.8, 0), hkPlugin);

    const observable = hkPlugin.onTriggerCollisionObservable;
    const observer = observable.add((event) => {
      if (event.type === "TRIGGER_ENTERED") {
        const dict: Record<string, TransformNode> = {};

        dict[event.collider.transformNode.name] = event.collider.transformNode;
        dict[event.collidedAgainst.transformNode.name] =
          event.collidedAgainst.transformNode;

        if ("player" in dict && "coin" in dict) {
          if (!dict["player"].metadata.isDying)
            this.coinManager.get(dict["coin"]);
        } else if ("player" in dict && "enemy" in dict) {
          this.playerManager.kill(dict["player"]);
        }
      }
    });

    // Assets

    const contentManager = new ContentManager(scene);
    await contentManager.assetsManager.loadAsync();

    await contentManager.loadBgm();
    await contentManager.loadSfx();

    // Level

    const sceneManager = new SceneManager(scene, contentManager.models);
    this.playerManager = new PlayerManager(sceneManager, contentManager, this);
    this.coinManager = new CoinManager(sceneManager, contentManager, this);
    this.enemyManager = new EnemyManager(sceneManager, contentManager);

    // Game

    this.coinManager.spawn();
    this.enemyManager.spawn();

    engine.runRenderLoop(() => {
      scene.render();
    });

    // Debug

    // setInterval(() => {
    //   this.fps = engine.getFps().toFixed(2);
    // }, 200);

    // ShowInspector(scene);

    // State

    this.state = GameState.MENU;
    engine.hideLoadingUI();
  }

  public start() {
    Howler.ctx?.resume();

    this.score = 0;
    this.currentEnemyCount = 0;
    this.enemyManager.clear();
    this.playerManager.spawn();
    this.state = GameState.PLAYING;
  }

  public update() {
    this.score++;

    if (this.score >= (this.currentEnemyCount + 1) * 6) {
      this.enemyManager.spawn();
      this.currentEnemyCount++;
    }
  }

  public end() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem("highScore", this.highScore.toString());
    }

    this.state = GameState.MENU;
  }
}

export enum GameState {
  ASLEEP = 0,
  MENU = 1,
  PLAYING = 2,
  INIT = 3,
}
