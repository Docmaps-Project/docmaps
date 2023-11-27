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
  let searchInput = '';
  let providingPlaintextDocmap = false;
  let json = undefined;
  let docmap;

  let key = 0; // Key is used to make sure Svelte re-renders the tab content from scratch whenever the active tab changes

  let activeTabName = 'Widget';

  // If a DOI is specified in the URL, use that.
  function getDoiToDisplay() {
    const params = new URLSearchParams(window.location.search);
    const doi = params.get('doi');
    if (doi) {
      requestedDoi = doi;
    }
    fetchData(requestedDoi);
  }

  onMount(() => {
    getDoiToDisplay();
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
      fetchData(searchInput);
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

  function displayWidgetWithDocmapLiteral() {
    json = JSON.parse(searchInput);
    if (Array.isArray(json)) {
      json = json[0];
    }
    docmap = json;
    showContent = true;
    key += 1;
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

  function reset() {
    searchInput = '';
    docmap = undefined;
    requestedDoi = undefined;
    json = undefined;
    showContent = false;
    activeTabName = 'Widget';
  }

  const toggleInputMethod = () => {
    providingPlaintextDocmap = !providingPlaintextDocmap;
    // Clear everything
    reset();
  };

  // Reactive statements
  $: tabs = [
    {
      name: 'Widget',
      component: Widget,
      show: true,
      props: { doi: requestedDoi, docmap },
    },
    {
      name: 'Crossref Demo',
      component: CrossrefDemo,
      show: !providingPlaintextDocmap,
      props: { json },
    },
  ];

  $: if (typeof requestedDoi !== 'undefined' && requestedDoi) {
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('doi', requestedDoi);
    window.history.replaceState({}, '', newUrl);
  }
</script>

<main>
  <h1>Docmap Explorer</h1>
  {#if providingPlaintextDocmap}

    <!-- Enter custom docmap -->
    <textarea bind:value='{searchInput}' placeholder='Enter your docmap here'></textarea>
    <button on:click='{displayWidgetWithDocmapLiteral}'>Display Docmap</button>
    <br>
    <span class='toggle-input' on:click='{toggleInputMethod}'>Use search instead</span>

  {:else}

    <!-- Dropdown or search -->
    <select on:change='{onSelectionChange}'>
      <option value=''>Select a DOI</option>
      {#each dois as doi}
        <option value='{doi}'>{doi}</option>
      {/each}
    </select>
    <span>or</span>
    <input type='text' bind:value='{searchInput}' on:keyup='{handleKeyup}' placeholder='Enter Your DOI Here' />
    <button on:click='{() => fetchData(searchInput)}'>Fetch Docmap</button>
    <br>
    <span class='toggle-input' on:click='{toggleInputMethod}'>Provide a docmap as text instead</span>
  {/if}
  <br>

  {#if showContent}
    {#if !providingPlaintextDocmap}
      <p style='margin-top: 60px;'><i>Showing results for: {requestedDoi}</i></p>
    {/if}

    <!-- Tab buttons -->
    <div class='tabs'>
      {#each tabs as tab, index}
        {#if tab.show}
          <span class='tab {tab.name === activeTabName ? "active" : ""}' on:click={() => handleClick(tab.name)}
                role='tab' tabindex={index}>
            {tab.name}
          </span>
        {/if}
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


    .toggle-input {
        color: blue;
        cursor: pointer;
        font-size: 0.9em;
        margin-left: 10px;
        text-decoration: underline;
        text-decoration-color: blue;
    }

    textarea {
        width: 100%;
        min-height: 150px;
        margin-top: 10px;
        padding: 10px;
        border: 1px solid #dee2e6;
        border-radius: 0.25rem;
    }

    @media (min-width: 640px) {
        main {
            max-width: none;
        }
    }
</style>
