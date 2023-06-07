<script>
  import Prism from "prismjs";
  import "prismjs/components/prism-json";
  import "prismjs/themes/prism.css";
  import { afterUpdate } from "svelte";

  let codeElement;

  export let json;
  let formattedJson;

  $: {
    formattedJson = JSON.stringify(json, null, 2);
    if (codeElement) {
      codeElement.textContent = formattedJson;
      Prism.highlightElement(codeElement);
      console.log(json);
    }
  }

</script>

<pre class="language-json"><code class="language-json" bind:this={codeElement}></code></pre>

<style>
  pre {
  }
  code {
  }
</style>
