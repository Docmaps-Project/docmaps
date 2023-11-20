<script>
  import { onMount } from 'svelte';
  import { configureForDoiString, structureError } from './utils.js';
  import JsonBox from "./JsonBox.svelte";
  import '@docmaps/widget';

  let inputDoi = '';
  let placeholder;
  let widgetElement;

  let codeBox;
  let json = undefined;

  function handleData(data) {
    let config = {
      display: {
	publisherName: name => name || "Preprint posted on Crossref"
      }
    }

    json=data;
  }

  function handleError(error) {
    json=structureError(error);
  }

  async function fetchData() {
    if (!widgetElement) {
      widgetElement = document.createElement('docmaps-widget');
      widgetElement.setAttribute('serverurl', 'https://web-nodejs.onrender.com')
      widgetElement.setAttribute('doi', inputDoi)
      placeholder.appendChild(widgetElement);
    }
    await configureForDoiString(
      inputDoi,
      handleData,
      handleError,
    );
  }
</script>

<main>
  <h1>Demo: crossref-to-docmap</h1>
  <input
    type="text"
    bind:value="{inputDoi}"
    placeholder="Enter your DOI here"
  />
  <!-- Your other markup and code -->
  <button on:click="{fetchData}">Fetch Data</button>
  <div id="result" bind:this="{placeholder}"></div>
  <div class="code-container">
    <b>Derived Docmap contents:</b>
    <JsonBox {json} bind:this="{codeBox}"/>
  </div>
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    margin: 0 auto;
  }

  #result {
    padding-top: 3em;
    padding-bottom: 3em;
    margin: auto;
    max-width: 500px;
  }

  .code-container {
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  input {
    min-width: 400px;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
