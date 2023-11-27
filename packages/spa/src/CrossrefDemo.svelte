<script>
  import JsonBox from './JsonBox.svelte';

  export let json;

  $: if (json) {
    console.log('Received JSON:', json);
  }
  export let key;
</script>

{#key key} <!--Make sure changes to key trigger a rerender -->
  <div class='code-container'>
    <h2>Docmap derived from CrossRef</h2>
    <JsonBox {json} />
  </div>
{/key}