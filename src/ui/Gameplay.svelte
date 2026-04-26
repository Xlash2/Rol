<script lang="ts">
  import { fade } from "svelte/transition";
  import type { Game } from "../core/Game.svelte";

  let { game }: { game: Game } = $props();
</script>

<div transition:fade class="top-left">
  <span class="icon-text">
    <span class="icon">
      <img alt="" src="./icons/coin.png" />
    </span>
    <span><strong>{game.score}</strong> </span>
  </span>
</div>
