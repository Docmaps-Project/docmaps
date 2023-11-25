<script>
  import { structureError } from './utils.js';
  import '@docmaps/widget';
  import Widget from './Widget.svelte';
  import CrossrefDemo from './CrossrefDemo.svelte';
  import { CreateCrossrefClient, ItemCmd } from '@docmaps/etl';
  import { isLeft } from 'fp-ts/Either';

  let inputDoi = '';
  let placeholder;
  let widgetElement;

  let codeBox;
  let json = undefined;

  $: tabs = [
    { name: 'Widget', component: Widget, props: { doi: inputDoi } },
    { name: 'Crossref Demo', component: CrossrefDemo, props: { json } },
  ];
  let activeTabName = 'Crossref Demo';
  let key = 0;
  const handleClick = tabName => {
    key += 1;
    activeTabName = tabName;
  };

  let showContent = false;

  function handleData(data) {
    json = data;
    showContent = true;
    console.log(json);
  }

  function handleError(error) {
    json = structureError(error);
  }

  // function renderWidget() {
  //   console.log('rendering widget');
  //   if (!placeholder) {
  //     return;
  //   }
  //
  //   placeholder.innerHTML = '';
  //   const widgetTitle = document.createElement('h2');
  //   widgetTitle.appendChild(document.createTextNode('Docmaps Widget'));
  //   placeholder.appendChild(widgetTitle);
  //   const widgetExplanation = document.createElement('h4');
  //   widgetExplanation.appendChild(document.createTextNode('(Docmap fetched from staging server)'));
  //   placeholder.appendChild(widgetExplanation);
  //   placeholder.appendChild(document.createElement('br'));
  //
  //   widgetElement = document.createElement('docmaps-widget');
  //   widgetElement.setAttribute('serverurl', 'https://web-nodejs.onrender.com');
  //   widgetElement.setAttribute('doi', inputDoi);
  //   placeholder.appendChild(widgetElement);
  // }

  async function fetchData() {
    // if (!widgetElement) {
    //   renderWidget();
    // }
    key += 1;
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

  async function configureForDoiString(doi, handleJson, handleError) {

    const result = await ItemCmd(
      [doi],
      {
        source: {
          preset: 'crossref-api',
          client: CreateCrossrefClient({
            politeMailto: "docmaps+spa@knowledgefutures.org"
          }),
        },
        publisher: {
          name: 'Inferred from Crossref',
          url: 'https://github.com/docmaps-project/docmaps/tree/main/packages/ts-etl',
        },
      }
    );

    if (isLeft(result)) {
      console.log("Got error while building docmap from crossref:",  JSON.stringify(result.left));
      handleError(result.left)
    } else {
      console.log("Got docmap from crossref");
      handleJson(result.right)
    }
  }
</script>

<main>
  <h1>Docmap Explorer</h1>
  <input type='text' bind:value='{inputDoi}' on:keyup='{handleKeyup}' placeholder='Enter Your DOI Here' />
  <button on:click='{fetchData}'>Fetch Docmap</button>


  {#if showContent}
    <!-- Tab buttons -->
    <div class='tabs'>
      {#each tabs as tab, index}
      <span class='tab {tab.name === activeTabName ? "active" : ""}' on:click={() => handleClick(tab.name)} role='tab'
            tabindex={index}>
        {tab.name}
      </span>
      {/each}
    </div>

    <!-- Tab content -->
    <div class='tab-contents'>

      {#each tabs as tab}
        {#if tab.name === activeTabName}
          <svelte:component this={tab.component} {...tab.props} key={`${activeTabName}${key}`} />
        {/if}
      {/each}
    </div>
  {/if}


</main>

<style>
    main {
        text-align: center;
        padding: 1em;
        margin: 0 auto;
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

    .tabs {
        display: flex;
        flex-wrap: wrap;
        padding-left: 0;
        margin-bottom: 0;
        list-style: none;
        border-bottom: 1px solid #dee2e6;
    }


    .tab {
        border: 1px solid transparent;
        border-top-left-radius: 0.25rem;
        border-top-right-radius: 0.25rem;
        display: block;
        padding: 0.5rem 1rem;
        cursor: pointer;
        margin-bottom: -1px;
    }

    .tab.active {
        color: #495057;
        background-color: #fff;
        border-color: #dee2e6 #dee2e6 #fff;
    }

    .tab-contents {
        margin-bottom: 10px;
        padding: 40px;
        border: 1px solid #dee2e6;
        border-radius: 0 0 .5rem .5rem;
        border-top: 0;
    }


    .tab:hover {
        background-color: #ddd;
    }

    @media (min-width: 640px) {
        main {
            max-width: none;
        }
    }
</style>
