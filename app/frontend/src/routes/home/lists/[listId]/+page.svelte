<script>
  import { onMount } from 'svelte';
  import axios from 'axios';
  import { page } from '$app/stores';

  const listId = $page.params.listId;
  const url = 'http://localhost:8000/api/stock';  // change to lists API when working

  let products = [];
  let fadeIn = false;
  let selectedItems = []; // using an array for selected items
  const supplierColors = {
    'Bidfood': '#d42000',
    'Reynolds': '#FF5733',
    'Birtwistles': '#4e0b58',
    'DeliceDeFrance': '#3357FF',
    'DestinyFoods': '#3299c5'
  };

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

  const getBadgeColor = (supplier) => {
    return supplierColors[supplier];
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
    background-color: #032939;
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
    background: rgba(0, 0, 0, 0.67);
    z-index: -1; 
  }

  .content {
    position: relative;
    z-index: 1;
    color: white;
    opacity: 0;
    transition: opacity 1s ease-in-out;
    overflow-y: auto; /* enable vertical scrolling */
    max-height: 85vh; /* max height to control the scrollable area */
  }

  .fade-in {
    opacity: 1;
  }

  .table-container {
    overflow-y: auto;
    max-height: 80vh; /* max height of the table container */
    margin-top: 3vh;
  }

  table {
    border-collapse: separate;
    border-spacing: 3px; /* adds space around the outside of cells */
    width: 100%;
  }

  th, td {
    padding: 15px; /* increased space inside each cell */
    border: 1px solid rgb(73, 109, 90);
    background-color: #26342c;
    color: #d1dfda;
    text-align: center;
    vertical-align: middle;
    border-radius: 2px; /* rounded corners for cells */
  }

  th {
    background-color: #2f4036;
    font-size: 1.2em
  }

  .selected {
    background-color: #d1dfda;
  }

  .toggle-button {
    cursor: pointer;
    width: 40px;
    height: 40px;
    border: 3px solid #d1dfda;
    border-radius: 50%;
    background-color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.15s;
    font-size: 1.2em;
  }

  .toggle-button.selected {
    background-color: #23ab37;
    color: #fff;
  }

  .card {
    background-color: #d1dfda;
    color: #15432a;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.1s ease, background-color 0.1s ease;
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

  .badge {
    margin: 0;
    padding: 7px 13px;
    border-radius: 0.5vw;
    font-size: 2.2vh;
    font-family: Arial;
    letter-spacing: 0.5px;
    color: #d1dfda;
    display: inline-block;
  }

  .no-spacing td {
    margin: 0;
    padding: 0;
  }

  .spacing-x {
    margin-left: 0;
    margin-right: 0;
  }
</style>



<div class="background {fadeIn ? 'fade-in' : ''}">
	<div class="background-wrapper {fadeIn ? 'fade-in' : ''}">
		<div class="background-overlay"></div>
		<div class="content {fadeIn ? 'fade-in' : ''} ml-[3vw] mr-[3vw] pl-[5vw] pr-[5vw]">
			<h1
				class="font-serif text-[6vh] mt-[4vh] backdrop-blur-lg bg-[#477159] bg-opacity-30 h-[7vh]"
			>
				{listId}
			</h1>

			{#if products.length > 0}
				<div class="table-container">
					<table class="table-compact w-full mt-[1vh] no-spacing">
						<thead>
							<tr>
								<th>Select</th>
								<th>Product</th>
								<th>Quantity</th>
								<th>Supplier</th>
								<th>Frozen</th>
							</tr>
						</thead>
						<tbody>
							{#each products as product}
								<tr class="spacing-x">
									<td class="flex justify-center">
										<button
											class={`toggle-button ${selectedItems.includes(product.Product) ? 'selected' : ''}`}
											on:click={() => toggleSelection(product)}
										>
										</button>
									</td>
									<td
										class="font-semibold bg-[#26342c] rounded-lg pl-[2vw] border-[#000000] border-md"
										>{product.Product}</td
									>
									<td class="bg-[#26342c] rounded-lg border-[#000000] border-md"
										>{product.Quantity}</td
									>
									<td class="bg-[#26342c] rounded-lg border-[#000000] border-md"
										><span class="badge" style="background-color: {getBadgeColor(product.Supplier)}"
											>{product.Supplier}</span
										></td
									>
									<td class="bg-[#26342c] rounded-lg border-[#000000] border-md"
										>{product.Frozen}</td
									>
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
