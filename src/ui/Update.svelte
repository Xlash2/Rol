<script lang="ts">
  let {
    updateServiceWorker,
  }: { updateServiceWorker: (reloadPage?: boolean) => Promise<void> } =
    $props();
</script>

<div class="top-right">
  <button
    onclick={() => {
      updateServiceWorker(true);
    }}
    class="button">UPDATE</button
  >
</div>
