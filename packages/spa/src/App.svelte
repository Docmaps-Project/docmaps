<script>
  import { onMount } from 'svelte';
  import { configureForDoiString } from './utils.js';
  import '@source-data/render-rev/render-rev.js';

  let inputDoi = '';
  let placeholder;
  let renderRevElement;

  async function fetchData() {
    if (!renderRevElement) {
      renderRevElement = document.createElement('render-rev');
      placeholder.appendChild(renderRevElement);
    }
    await configureForDoiString(renderRevElement, inputDoi);
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
  <div id="result" bind:this="{placeholder}">
  </div>
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

	input {
		min-width: 400px;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
