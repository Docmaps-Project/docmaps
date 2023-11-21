<script>
  import { configureForDoiString, structureError } from './utils.js';
  import JsonBox from './JsonBox.svelte';
  import '@docmaps/widget';

  let inputDoi = '';
  let placeholder;
  let widgetElement;

  let codeBox;
  let json = undefined;

  function handleData(data) {
    let config = {
      display: {
        publisherName: name => name || 'Preprint Posted on Crossref',
      },
    };

    json = data;
  }

  function handleError(error) {
    json = structureError(error);
  }

  async function fetchData() {
    if (!widgetElement) {
      const widgetTitle = document.createElement('h2');
      widgetTitle.appendChild(document.createTextNode('Docmaps Widget'));
      placeholder.appendChild(widgetTitle);
      const widgetExplanation = document.createElement('h4');
      widgetExplanation.appendChild(document.createTextNode('(Docmap fetched from staging server)'));
      placeholder.appendChild(widgetExplanation);
      placeholder.appendChild(document.createElement('br'));

      widgetElement = document.createElement('docmaps-widget');
      widgetElement.setAttribute('serverurl', 'https://web-nodejs.onrender.com');
      widgetElement.setAttribute('doi', inputDoi);
      placeholder.appendChild(widgetElement);
    }
    await configureForDoiString(
      inputDoi,
      handleData,
      handleError,
    );
  }

  function handleKeyup(event) {
    if (event.key === 'Enter') {
      fetchData();
    }
  }
</script>

<main>
  <h1>Demo: CrossRef to Docmap</h1>
  <input type='text' bind:value='{inputDoi}' on:keyup='{handleKeyup}' placeholder='Enter Your DOI Here' />
  <button on:click='{fetchData}'>Fetch Docmap</button>
  <div id='result' bind:this='{placeholder}'></div>
  <div class='code-container'>
    <h2>Raw Docmap</h2>
    <h4>(Docmap derived from CrossRef)</h4>
    <JsonBox {json} bind:this='{codeBox}' />
  </div>
</main>

<style>
    main {
        text-align: center;
        padding: 1em;
        margin: 0 auto;
    }

    #result {
        padding-top: 1em;
        padding-bottom: 1em;
        margin: auto;
        max-width: 510px;
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
