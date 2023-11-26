<script>
  import '@docmaps/widget';

  export let doi;
  export let key;
</script>

{#if doi}
  <div id='result'>
    <h2>Docmaps widget</h2>
    <h4>Docmap fetched from the Docmaps staging server.</h4>
    <docmaps-widget doi={doi} serverurl='https://web-nodejs.onrender.com'></docmaps-widget>
  </div>
{/if}

<style>

    #result {
        padding-top: 1em;
        padding-bottom: 1em;
        margin: auto;
        max-width: 510px;
    }
</style>
