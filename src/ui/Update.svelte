<script lang="ts">
  let {
    updateServiceWorker,
  }: { updateServiceWorker: (reloadPage?: boolean) => Promise<void> } =
    $props();
</script>

<div class="update top-right">
  <button
    onclick={() => {
      updateServiceWorker(true);
    }}
    class="button">UPDATE</button
  >
</div>

<style>
  .update {
    z-index: 2;
  }
</style>
