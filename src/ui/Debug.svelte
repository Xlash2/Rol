<script lang="ts">
  import { fade } from "svelte/transition";
  import type { Game } from "../core/Game.svelte";

  let { game }: { game: Game } = $props();
</script>

<div transition:fade class="bot-left">
  <strong>{game.fps}</strong>
</div>
