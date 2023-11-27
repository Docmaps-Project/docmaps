<script>
  import { structureError } from './utils.js';
  import dois from './dois.js';
  import '@docmaps/widget';
  import Widget from './Widget.svelte';
  import CrossrefDemo from './CrossrefDemo.svelte';
  import { CreateCrossrefClient, ItemCmd } from '@docmaps/etl';
  import { isLeft } from 'fp-ts/Either';
  import { onMount } from 'svelte';

  let requestedDoi;
  let textInputDoi = '';
  let json = undefined;

  let key = 0; // Key is used to make sure Svelte re-renders the tab content from scratch whenever the active tab changes

  let activeTabName = 'Widget';

  function parseQueryString() {
    const params = new URLSearchParams(window.location.search);
    const doi = params.get('doi');
    if (doi) {
      requestedDoi = doi;
      fetchData(doi);
    }
  }

  onMount(() => {
    parseQueryString();
  });

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

  function handleKeyup(event) {
    if (event.key === 'Enter') {
      fetchData(textInputDoi);
    }
  }

  function onSelectionChange(event) {
    const selectedDoi = event.target.value;
    fetchData(selectedDoi);
  }

  async function fetchData(doi) {
    requestedDoi = doi;
    key += 1;
    await configureForDoiString(
      doi,
      handleData,
      handleError,
    );
  }


  async function configureForDoiString(doi, handleJson, handleError) {
    const result = await ItemCmd(
      [doi],
      {
        source: {
          preset: 'crossref-api',
          client: CreateCrossrefClient({
            politeMailto: 'docmaps+spa@knowledgefutures.org',
          }),
        },
        publisher: {
          name: 'Inferred from Crossref',
          url: 'https://github.com/docmaps-project/docmaps/tree/main/packages/ts-etl',
        },
      },
    );

    if (isLeft(result)) {
      console.log('Got error while building docmap from crossref:', JSON.stringify(result.left));
      handleError(result.left);
    } else {
      console.log('Got docmap from crossref');
      handleJson(result.right);
    }
  }

  // Reactive statements
  $: tabs = [
    { name: 'Widget', component: Widget, props: { doi: requestedDoi } },
    { name: 'Crossref Demo', component: CrossrefDemo, props: { json } },
  ];

  $: if (typeof requestedDoi !== 'undefined' && requestedDoi) {
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('doi', requestedDoi);
    window.history.replaceState({}, '', newUrl);
  } else if (requestedDoi === '') {
    const newUrl = new URL(window.location);
    newUrl.searchParams.delete('doi');
    window.history.replaceState({}, '', newUrl);
  }
</script>

<main>
  <h1>Docmap Explorer</h1>
  <select on:change='{onSelectionChange}'>
    <option value=''>Select a DOI</option>
    {#each dois as doi}
      <option value='{doi}'>{doi}</option>
    {/each}
  </select>

  <span>or</span>

  <input type='text' bind:value='{textInputDoi}' on:keyup='{handleKeyup}' placeholder='Enter Your DOI Here' />
  <button on:click='{() => fetchData(textInputDoi)}'>Fetch Docmap</button>
  <br>

  {#if showContent}
    <p><i>Showing results for: {requestedDoi}</i></p>

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

          <svelte:component this={tab.component} {...tab.props} key={key} />
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
        margin-top: 40px;
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
