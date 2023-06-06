<script>
  import { onMount } from 'svelte';
  import { configureForDoiString } from './utils.js';
  import '@source-data/render-rev/render-rev.js';
  import JsonBox from "./JsonBox.svelte";

  let inputDoi = '';
  let placeholder;
  let renderRevElement;

  let codeBox;
  let json = undefined;

  function handleData(data) {
    let config = {
      display: {
	publisherName: name => name || "Preprint posted on Crossref"
      }
    }

    renderRevElement.configure({
      ...config,
      docmaps: data,
    });

    json=data;
  }

  function handleError(error) {
    renderRevElement.configure({
      docmaps: error, // hacky solution
    });

    json=JSON.stringify(error, ['message', 'cause']);
  }

  async function fetchData() {
    if (!renderRevElement) {
      renderRevElement = document.createElement('render-rev');
      placeholder.appendChild(renderRevElement);
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
    max-width: 600px;
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
