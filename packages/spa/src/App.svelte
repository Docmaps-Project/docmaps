<script>
  import { onMount } from 'svelte';
	import '@source-data/render-rev/render-rev.js';

  let inputDoi = '';
  let placeholder;
	//export let renderRev;
	let renderRevElement;

  onMount(() => {
	  renderRevElement = document.createElement('render-rev')
  });

  function fetchData() {
    renderRevElement.configure({
      doi: '10.1101/2020.07.20.212886',
      display: {
        publisherName: name => name.toUpperCase(),
      },
    });
    if (placeholder) {
      placeholder.appendChild(renderRevElement);
    }
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
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	#result {
	  padding-top: 3em;
		margin: auto;
		max-width: 600px;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
