<script lang="ts">
  import { useRegisterSW } from "virtual:pwa-register/svelte";
  import { Game, GameState } from "./core/Game.svelte";
  import Gameplay from "./ui/Gameplay.svelte";
  import Menu from "./ui/Menu.svelte";
  import Splash from "./ui/Splash.svelte";
  import Update from "./ui/Update.svelte";
  import { onMount } from "svelte";

  let game: Game = new Game();
  let isFullscreen = $state(false);
  let isSafari = $state(false);

  let isCheckingOrientation = $state(false);

  let displaySplash = $derived(
    (isSafari && game.state === GameState.ASLEEP) ||
      (!isSafari && !isFullscreen),
  );

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

  async function prepareScreen() {
    try {
      await document.documentElement.requestFullscreen();
      await screen.orientation.lock("portrait");
    } catch (err) {
      console.warn(err.message);
    }
  }

  async function checkDeviceOrientation() {
    if (isCheckingOrientation) {
      window.alert("You guys have phones right?");
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
      isSafari = true;
      const permission = await DeviceOrientationEvent.requestPermission();
      if (permission === "granted") {
        game.init();
        if (!localStorage.getItem("iosNoti")) {
          window.alert(
            "Please play in portrait mode with auto rotation locked.",
          );
          localStorage.setItem("iosNoti", "1");
        }
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
