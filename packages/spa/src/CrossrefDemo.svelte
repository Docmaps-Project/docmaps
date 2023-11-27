<script>
  import JsonBox from './JsonBox.svelte';

  export let json;

  $: if (json) {
    console.log('Received JSON:', json);
  }
  export let key;
</script>

<div class='code-container'>
  <h2>Docmap derived from CrossRef</h2>
  <JsonBox {json} />
</div>
