<script>
  import { onMount } from 'svelte';
  import axios from 'axios';
  import { page } from '$app/stores';
  
  const listId = $page.params.listId;
  const url = 'http://localhost:8000/api/stock';  // change to lists API when working
  
  // using an array to store the fetched data
  let products = [];
  let fadeIn = false;

  const getFromSupplier = async () => {
    try {
      const response = await axios.get(`${url}/from/${listId}`);
      const fetchedProducts = response.data;
      products = fetchedProducts.sort((a, b) => a.Product.localeCompare(b.Product));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  onMount(() => {
    setTimeout(() => {
      fadeIn = true;
    }, 100); // short delay to ensure the initial render completes

    getFromSupplier();
  });
</script>

<style>
  .fade-in {
    opacity: 1;
    transition: opacity 1s ease-in-out;
  }

  .content {
    opacity: 0;
  }
</style>

<div class="{fadeIn ? 'fade-in' : 'content'}">
  <h1>Product List</h1>
  {#if products.length > 0}
    <ul>
      {#each products as { Product, Quantity, Supplier }}
        <li>{Product}, {Quantity}, {Supplier}</li>
      {/each}
    </ul>
  {:else}
    <p>No products available.</p>
  {/if}
</div>
