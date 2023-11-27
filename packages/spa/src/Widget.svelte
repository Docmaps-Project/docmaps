<script>
  import '@docmaps/widget';

  export let doi;
  export let key;
  export let docmap;

  customElements.whenDefined('docmaps-widget') // wait for the custom docmaps-widget element to be defined
    .then(() => {
      const widgetElement = document.getElementById('docmaps-widget-target');
      widgetElement.docmap = docmap;
    });
</script>

{#key key} <!--Make sure changes to key trigger a rerender -->
  <div id='result'>
    <h2>Docmaps widget</h2>

    {#if doi}
      <h4>Docmap fetched from the Docmaps staging server.</h4>
      <docmaps-widget doi={doi} serverurl='https://web-nodejs.onrender.com'></docmaps-widget>
    {:else if docmap}
      <h4>From plaintext docmap</h4>
      <docmaps-widget id='docmaps-widget-target'></docmaps-widget>
    {/if}
  </div>
{/key}

<style>
    #result {
        padding-top: 1em;
        padding-bottom: 1em;
        margin: auto;
        max-width: 510px;
    }
</style>
