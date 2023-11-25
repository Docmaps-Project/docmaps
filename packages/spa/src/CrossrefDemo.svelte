<script>
  import JsonBox from './JsonBox.svelte';

  export let json;

  $: if (json) {
    console.log('Received JSON:', json);
  }
  export let key;
</script>

<div class='code-container'>
  <h2>Raw Docmap</h2>
  <h4>(Docmap derived from CrossRef)</h4>
  <JsonBox {json} />
</div>