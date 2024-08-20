<script>
  import { onMount } from 'svelte';
  import axios from 'axios';
  import { page } from '$app/stores';

  const listId = $page.params.listId;
  const url = 'http://localhost:8000/api/stock';  // change to lists API when working

  let products = [];
  let fadeIn = false;
  let selectedItems = []; // using an array for selected items

  const getFromSupplier = async () => {
    try {
      const response = await axios.get(`${url}/from/${listId}`);
      const fetchedProducts = response.data;
      products = fetchedProducts.sort((a, b) => a.Product.localeCompare(b.Product));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const toggleSelection = (product) => {
    const productId = product.Product;
    const index = selectedItems.indexOf(productId);
    
    if (index === -1) {
        // product not in array, add it
        selectedItems = [...selectedItems, productId];
        console.log(`added ${productId}`);
    } else {
        // product in array, remove it
        selectedItems = selectedItems.filter(item => item !== productId);
        console.log(`removed ${productId}`);
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
  .background {
    position: absolute;
    height: 100vh;
    width: 100vw;
    background-color: #033839;
    z-index: -3;
  }

  .background-wrapper {
    position: relative;
    height: 100vh;
    overflow: hidden;
  }

  .background-wrapper::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('/pexels-martinpechy-2078266.jpg');
    background-size: cover;
    background-position: center;
    filter: blur(25px);
    z-index: -2;
  }

  .background-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.55);
    z-index: -1; 
  }

  .content {
    position: relative;
    z-index: 1;
    color: white;
    opacity: 0;
    transition: opacity 1s ease-in-out;
    overflow-y: auto;
    max-height: 85vh;
  }

  .fade-in {
    opacity: 1;
  }

  .table-container {
    position: relative;
    overflow-y: auto;
    max-height: 80vh;
  }

  /* Gradient overlay to suggest scrolling */
  .scroll-indicator::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 30px;
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.8));
    pointer-events: none;
  }

  .selected {
    background-color: #d1dfda;
  }

  .toggle-button {
    cursor: pointer;
    width: 40px;
    height: 40px;
    border: 1px solid #ccc;
    border-radius: 50%;
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.3s;
    font-size: 1.2em;
  }

  .toggle-button.selected {
    background-color: #000000;
    color: #fff;
  }

  .card {
    background-color: #d1dfda;
    color: #15432a;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.25s ease, background-color 0.25s ease;
    font-weight: 525;
  }

  .card:hover {
    transform: translateY(-1px); /* slight hover effect */
    scale: 1.01;
  }

  .card dt,
  .card dd {
    color: #174b2e; /* Ensure the text inside the card is this color */
  }

  .card dd {
    margin-top: 0.5em;
  }
</style>


<div class="background {fadeIn ? 'fade-in' : ''}">
  <div class="background-wrapper {fadeIn ? 'fade-in' : ''}">
    <div class="background-overlay"></div>
    <div class="content {fadeIn ? 'fade-in' : ''} ml-[2vw]">
      <h1 class="font-serif text-[6vh] mt-[4vh]">{listId}</h1>
      {#if products.length > 0}
        <div class="table-container scroll-indicator">
          <table class="table-compact w-full mt-[5vh]">
            <thead>
              <tr>
                <th>Select</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Supplier</th>
              </tr>
            </thead>
            <tbody>
              {#each products as product}
                <tr>
                  <td>
                    <button 
                      class={`toggle-button ${selectedItems.includes(product.Product) ? 'selected' : ''}`} 
                      on:click={() => toggleSelection(product)}>
                    </button>
                  </td>
                  <td>{product.Product}</td>
                  <td>{product.Quantity}</td>
                  <td>{product.Supplier}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {:else}
        <p>No products available.</p>
      {/if}
    </div>
  </div>
</div>