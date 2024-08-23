<script>
    import { onMount } from 'svelte';
    import axios from 'axios';
    import { page } from '$app/stores';

    const listId = $page.params.listId;
    const url = 'http://localhost:8000/api/stock'; // change to lists API when working

    let products = [];
    let fadeIn = false;
    let selectedItems = [];
    let addedItems = [];
    let removedItems = [];
    const supplierColors = {
        Bidfood: '#d42000',
        Reynolds: '#FF5733',
        Birtwistles: '#4e0b58',
        DeliceDeFrance: '#1d43da',
        DestinyFoods: '#3299c5'
    };

    let showAddRow = false; 
    let newProduct = { Product: '', Quantity: '', Supplier: '', Frozen: 'No' }; // initial state for new blank product

    const getFromSupplier = async () => {
        try {
            const response = await axios.get(`${url}/from/${listId}`);
            const fetchedProducts = response.data;
            products = fetchedProducts.sort((a, b) => a.Product.localeCompare(b.Product));
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const removeItem = async (productName) => {
        try {
            removedItems.push(products.filter(product => product.Product === productName));
            products = products.filter(product => product.Product !== productName);


            if (addedItems.some(new_item => new_item.Product === item.Product)) {
                addedItems = addedItems.filter(new_item => new_item.Product !== item.Product);
            }
        } catch (error) {
            console.error('Error removing item:', error);
        }
    };

    const toggleSelection = (product) => {
        const productId = product.Product;
        const index = selectedItems.indexOf(productId);

        if (index === -1) {
            selectedItems = [...selectedItems, productId];
        } else {
            selectedItems = selectedItems.filter((item) => item !== productId);
        }
    };

    const getBadgeColor = (supplier) => {
        return supplierColors[supplier];
    };

    const addProduct = () => {
        if (newProduct.Product && newProduct.Quantity && newProduct.Supplier) {
            const item_id = `${newProduct.Product + newProduct.Quantity + newProduct.Supplier}`;
            console.log(`new item id: ${item_id}`);

            newProduct.id = item_id;
            addedItems.push(newProduct);
            products = [newProduct, ...products];
            newProduct = { Product: '', Quantity: '', Supplier: '', Frozen: 'No' };
            showAddRow = false;

            if (removedItems.some(item => item.Product === newProduct.Product)) {
                removedItems = removedItems.filter(item => item.Product !== newProduct.Product);
            }
        }
    };

    const cancelAddProduct = () => {
        newProduct = { Product: '', Quantity: '', Supplier: '', Frozen: 'No' };
        showAddRow = false;
    };

    const updateDatabase = async () => {
        try {
            const data = {
                toAdd: addedItems,
                toRemove: removedItems
            };

            await axios.post(`${url}/update`, data)
            .then((response) => {
                console.log('Database updated:', response.data);
            })
            .catch(error => {
                console.error('Error updating database:', error);
            });
            
            // clear lists when done to avoid removing / adding
            addedItems = [];
            removedItems = [];
        } catch (error) {
            console.error('Unexpected error:', error);
        }
    };


    onMount(() => {
        setTimeout(() => {
            fadeIn = true;
        }, 100);

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
        content: '';
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
        max-height: 95vh; /* max height to control the scrollable area */
    }

    .fade-in {
        opacity: 1;
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
        transition:
            transform 0.1s ease,
            background-color 0.1s ease;
        font-weight: 525;
    }

    .card:hover {
        transform: translateY(-1px); /* slight hover effect */
        scale: 1.01;
    }

    .card dt,
    .card dd {
        color: #174b2e;
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

    .trash-button {
        cursor: pointer;
        color: #ffffff;
        transition: transform 0.2s ease-in-out;
        font-size: 2.75vh;
    }

    .trash-button:hover {
        font-size: 3vh;
    }

    .icon-container {
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.3s ease, background-color 0.3s ease;
        width: 80px;
        height: 80px;
    }

    .icon-container i {
        color: #d1dfda; 
        font-size: 3em;
        transition: transform 0.3s ease;
    }

    .icon-container:hover i {
        color: #ffffff;
        transform: scale(1.1); 
    }

    .table-container {
        overflow-y: auto;
        max-height: 71.5vh; /* max height of the table container */
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
        font-size: 1.2em;
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

    td input, td select {
        width: 100%;
        padding: 10px;
        border: 1px solid #26342c;
        background-color: #26342c;
        color: #d1dfda;
        border-radius: 5px;
    }

    td input:focus, td select:focus {
        outline: 2px solid #ffffff;
        outline-offset: 2px;
    }


    .confirm-button {
        padding: 10px 15px;
        background-color: #21a134;
        color: #d1dfda;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.2s ease-in-out;
    }

    .confirm-button:hover {
        background-color: #1bb031;
    }

     .cancel-button {
        padding: 10px 15px;
        background-color: #d9534f;
        color: #d1dfda;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.2s ease-in-out;
    }

    .cancel-button:hover {
        background-color: #c9302c;
    }

    .flex-buttons {
        display: flex;
        align-items: center;
        gap: 10px;
    }
</style>

<div class="background {fadeIn ? 'fade-in' : ''}">
    <div class="background-wrapper {fadeIn ? 'fade-in' : ''}">
        <div class="background-overlay"></div>
        <div class="content {fadeIn ? 'fade-in' : ''} ml-[3vw] mr-[3vw] pl-[5vw] pr-[5vw]">
            <h1 class="font-serif text-[6vh] mt-[4vh] backdrop-blur-lg bg-[#477159] bg-opacity-30 h-[7vh]">
                {listId} items
            </h1>

            <div class="table-container">
                <table class="table-compact w-full mt-[1vh] no-spacing">
                    <thead>
                        <tr>
                            <th>Select</th>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Supplier</th>
                            <th>Frozen</th>
                            <th>Remove</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#if showAddRow}
                            <tr>
                                <td></td>
                                <td><input type="text" bind:value={newProduct.Product} placeholder="Product" /></td>
                                <td><input type="text" bind:value={newProduct.Quantity} placeholder="Quantity" /></td>
                                <td><input type="text" bind:value={newProduct.Supplier} placeholder="Supplier" /></td>
                                <td>
                                    <select bind:value={newProduct.Frozen}>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                </td>
                                <td>
                                    <button on:click={addProduct} class="confirm-button">Add</button>
                                    <button class="cancel-button" on:click={cancelAddProduct}>Cancel</button>
                                </td>
                            </tr>
                        {/if}

                        {#each products as product}
                            <tr class="spacing-x">
                                <td class="flex justify-center">
                                    <button
                                        class={`toggle-button ${selectedItems.includes(product.Product) ? 'selected' : ''}`}
                                        on:click={() => toggleSelection(product)}>
                                    </button>
                                </td>
                                <td class="font-semibold bg-[#26342c] rounded-lg pl-[2vw] border-[#000000] border-md">
                                    {product.Product}
                                </td>
                                <td class="bg-[#26342c] rounded-lg border-[#000000] border-md">
                                    {product.Quantity}
                                </td>
                                <td class="bg-[#26342c] rounded-lg border-[#000000] border-md">
                                    <span class="badge" style="background-color: {getBadgeColor(product.Supplier)}">{product.Supplier}</span>
                                </td>
                                <td class="bg-[#26342c] rounded-lg border-[#000000] border-md">
                                    <span class="badge bg-[#0091eb]">{(product.Frozen == "Yes") ? "Frozen" : "n/a"}</span>
                                </td>
                                <td class="bg-[#26342c] rounded-lg border-[#000000] border-md">
                                    <i class="bi bi-trash3-fill trash-button" on:click={() => removeItem(product.Product)}></i>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>

            {#if !showAddRow}
                <div class="flex-buttons">
                    <div class="icon-container mt-[1.5vh] ml-[1.85vw] fade-in" on:click={() => showAddRow = true}>
                        <i class="bi bi-plus-circle-fill"></i>
                    </div>
                    <button class="confirm-button mt-[1.5vh] ml-[65vw] w-[6vw]" on:click={() => updateDatabase()}>Save</button>
                    <button class="confirm-button mt-[1.5vh] w-[6vw]">Export</button>
                </div>
            {/if}
        </div>
    </div>
</div>