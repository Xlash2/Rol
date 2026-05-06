<script lang="ts">
  import { GameState, type Game } from "../core/Game.svelte";

  let {
    game,
    checkDeviceOrientation,
    prepareScreen,
  }: { game: Game; checkDeviceOrientation: Function; prepareScreen: Function } =
    $props();
</script>

<div
  class="center splash is-flex is-justify-content-center is-align-items-center"
>
  <div class="is-flex is-flex-direction-column" style="width: 180px;">
    <div class="field">
      <div class="control">
        <button
          onclick={() => {
            if (game.state === GameState.ASLEEP) checkDeviceOrientation();
            else prepareScreen();
          }}
          class="button is-fullwidth"
          >{game.state === GameState.ASLEEP ? "PLAY" : "RESUME"}</button
        >
      </div>
    </div>

    <div class="field">
      <div class="control">
        <button
          onclick={() => {
            window.alert(
              "A game by Xlash and K.\n\nDon't forget to tilt your phone.\n\nInstallable and playable offline! Go to your browser menu and add to home screen.",
            );
          }}
          class="button is-fullwidth">ABOUT</button
        >
      </div>
    </div>

    <div class="field">
      <div class="control">
        <button
          onclick={() => {
            window.open("https://github.com/Xlash2/Rol");
          }}
          class="button is-fullwidth">GITHUB</button
        >
      </div>
    </div>
  </div>
</div>

<style>
  .splash {
    background-color: rgba(0, 0, 0, 1);
    z-index: 1;
  }
</style>
