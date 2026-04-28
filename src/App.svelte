<script lang="ts">
  import { onMount } from "svelte";
  import { useRegisterSW } from "virtual:pwa-register/svelte";
  import { Game, GameState } from "./core/Game.svelte";
  import Gameplay from "./ui/Gameplay.svelte";
  import Menu from "./ui/Menu.svelte";
  import Splash from "./ui/Splash.svelte";
  import Update from "./ui/Update.svelte";

  let game: Game = new Game();
  let isFullscreen = $state(false);
  let isFullscreenNotSupported = $state(false);

  let isCheckingOrientation = $state(false);

  let displaySplash = $derived(
    (isFullscreenNotSupported && game.state === GameState.ASLEEP) ||
      (!isFullscreenNotSupported && !isFullscreen),
  );

  let currentOrientation = $state(screen.orientation.type);

  const { needRefresh, updateServiceWorker } = useRegisterSW();

  document.addEventListener("fullscreenchange", async () => {
    if (document.fullscreenElement) {
      isFullscreen = true;
    } else {
      isFullscreen = false;
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      isFullscreen = false;
      document.exitFullscreen().catch((err) => console.warn(err.message));
    }
  });

  document.addEventListener("visibilitychange", async () => {
    if (document.visibilityState === "visible") {
      navigator.wakeLock
        .request("screen")
        .catch((err) => console.warn(err.message));
    }
  });

  onMount(() => {
    navigator.wakeLock
      .request("screen")
      .catch((err) => console.warn(err.message));
  });

  screen.orientation.addEventListener("change", function (ev) {
    currentOrientation = this.type;
  });

  async function prepareScreen() {
    try {
      await document.documentElement.requestFullscreen();
    } catch (err) {
      isFullscreenNotSupported = true;
      console.warn(err.message);
    }

    try {
      await screen.orientation.lock("portrait");
    } catch (err) {
      console.warn(err.message);
    }
  }

  async function checkDeviceOrientation() {
    if (isCheckingOrientation) {
      window.alert("Don't click too much bro.");
      return;
    }

    isCheckingOrientation = true;

    const checkDeviceOrientationEvent = async (e: any) => {
      window.removeEventListener(
        "deviceorientation",
        checkDeviceOrientationEvent,
      );

      if (e.alpha !== null) {
        await prepareScreen();
        game.init();
      } else {
        window.alert("You guys have phones right?");
      }
    };

    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      const permission = await DeviceOrientationEvent.requestPermission();
      if (permission === "granted") {
        isFullscreenNotSupported = true;
        game.init();
      } else {
        window.alert("Why would you not allow it bro?");
      }
    } else {
      window.addEventListener("deviceorientation", checkDeviceOrientationEvent);
    }
  }

  // Debug

  // const vConsole = new VConsole();
</script>

<canvas class="is-unselectable" id="renderCanvas"></canvas>

{#if game.state === GameState.MENU}<Menu {game} />
{:else if game.state === GameState.PLAYING}
  <Gameplay {game} />
{/if}

<!-- {#if game.state !== GameState.ASLEEP && game.state !== GameState.INIT}
  <Debug {game} />
{/if} -->

{#if displaySplash}
  <Splash {game} {checkDeviceOrientation} {prepareScreen} />
{/if}

{#if $needRefresh}
  <Update {updateServiceWorker} />
{/if}

{#if currentOrientation.startsWith("landscape")}
  <div class="warning mb-1 has-text-centered">
    PLEASE PLAY IN PORTRAIT MODE.
  </div>{/if}
