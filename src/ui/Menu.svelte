<script lang="ts">
  import { fade } from "svelte/transition";
  import type { Game } from "../core/Game.svelte";

  let { game }: { game: Game } = $props();
</script>

<div
  transition:fade
  class="center is-flex is-justify-content-center is-align-items-center"
>
  <div class="is-flex is-flex-direction-column" style="width: 180px;">
    <div class="field">
      <div class="is-size-1 control has-text-centered">
        <strong class="logo">ROL</strong>
      </div>
    </div>

    <div class="field">
      <div class="control">
        <button
          onclick={() => {}}
          class="button is-fullwidth is-success is-outlined"
          >PAST : {game.score}</button
        >
      </div>
    </div>

    <div class="field">
      <div class="control">
        <button
          onclick={() => {
            game.start();
          }}
          class="button is-fullwidth is-link">PRESENT : 0</button
        >
      </div>
    </div>

    <div class="field">
      <div class="control">
        <button
          onclick={() => {}}
          class="button is-fullwidth is-danger is-outlined"
          >FUTURE : {game.highScore}</button
        >
      </div>
    </div>
  </div>
</div>

<style>
  .logo {
    text-shadow: 0 0 6px #ffffffbb;
  }
</style>
