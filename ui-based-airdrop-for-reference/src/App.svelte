<script>
  import Home from "@/components/Home.svelte";
  import { fade } from "svelte/transition";
  import Airdrop from "./components/Airdrop.svelte";

  let name = "UI based Airdrop for Reference";
</script>

<main transition:fade>
  <Home {name} />

  <Airdrop />
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
