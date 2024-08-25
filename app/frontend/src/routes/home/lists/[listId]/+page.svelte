<script>
    import { onMount } from 'svelte';
    import axios from 'axios';
    import { page } from '$app/stores';
    import { getModalStore } from '@skeletonlabs/skeleton';
    const modalStore = getModalStore();

    const listId = $page.params.listId;
    const url = 'http://localhost:8000/api/stock';

    let products = [];
    let fadeIn = false;
    let selectedItems = [];
    let addedItems = [];
    let removedItems = [];
    let selectedCount = 0;

    const supplierColors = {
        Bidfood: '#d42000',
        Reynolds: '#FF5733',
        Birtwistles: '#4e0b58',
        DeliceDeFrance: '#1d43da',
        DestinyFoods: '#3299c5'
    };

    let showAddRow = false; 
    let newProduct = { Product: '', Quantity: '', Supplier: '', Frozen: 'No' }; 

    let choice  = 'Export All';
    let fileType = 'Export Excel';

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
            const item = products.filter(product => product.Product === productName);
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
        const productName = product.Product;
        const index = selectedItems.indexOf(productName);

        if (index === -1) {
            selectedCount++;
            selectedItems = [...selectedItems, productName];
        } else {
            selectedCount--;
            selectedItems = selectedItems.filter((item) => item !== productName);
        }
    };

    const toggleSelectAll = () => {
        if (selectedCount > 0) {
            selectedCount = 0;
            selectedItems = [];
        } else {
            selectedCount = products.length;
            selectedItems = products.map(product => product.Product);
        }
    };


    const getBadgeColor = (supplier) => {
        return supplierColors[supplier];
    };

    const addProduct = () => {
        if (newProduct.Product && newProduct.Quantity && newProduct.Supplier) {
            const item_id = `${newProduct.Product + newProduct.Quantity + newProduct.Supplier}`;

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
            
            addedItems = [];
            removedItems = [];
        } catch (error) {
            console.error('Unexpected error:', error);
        }
    };

    const confirmSave = async () => {
        const modal = {
            type: 'confirm',
            title: 'Save changes',
            body: 'Are you sure you wish to save all changes made?',
            response: async (r) => {
                if (r) {
                    console.log('saving...');
                    await updateDatabase();
                }
            }
        };
        modalStore.trigger(modal);
    };


    const confirmExport = async () => {
        if(choice === 'Export All'){

            if (addedItems.length > 0 || removedItems.length > 0) {
                const modal = {
                    type: 'confirm',
                    title: 'Save changes before exporting',
                    body: 'You have unsaved changes. Save before exporting?',
                    response: async (r) => {
                        if (r) {
                            console.log('saving...');
                            await updateDatabase();
                        }
                    }
                };
                modalStore.trigger(modal);
            }

            if(fileType === 'Export Excel'){
                try {
                    const response = await axios.post(`http://localhost:8000/api/stock/export/excel`, null, {
                        responseType: 'blob', // to handle binary data
                    });

                    const blob = new Blob([response.data], {
                        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    });

                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', 'output.xlsx');
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                } catch (error) {
                    console.error('Error exporting data:', error);
                }
            }

            if(fileType === 'Export PDF'){
                try {
                    const response = await axios.post(`http://localhost:8000/api/stock/export/pdf`, null, {
                        responseType: 'blob', // to handle binary data
                    });

                    const blob = new Blob([response.data], {
                        type: 'application/pdf',
                    });

                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', 'output.pdf');
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                } catch (error) {
                    console.error('Error exporting data:', error);
                }
            }
        }

        if(choice === 'Export View'){
            if(fileType === 'Export Excel'){
                try {
                    const requestBody = {
                        items: products.map(item => item.Product)
                    };

                    const response = await axios.post(
                        'http://localhost:8000/api/stock/export/excel',
                        requestBody,
                        {
                            responseType: 'blob', // to handle binary data
                        }
                    );
                    const blob = new Blob([response.data], {
                        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    });

                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', 'output.xlsx');
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                } catch (error) {
                    console.error('Error exporting data:', error);
                }
            }

            if(fileType === 'Export PDF'){
                try {
                    const requestBody = {
                        items: products.map(item => item.Product)
                    };

                    const response = await axios.post(
                        'http://localhost:8000/api/stock/export/pdf',
                        requestBody,
                        {
                            responseType: 'blob', // to handle binary data
                        }
                    );

                    const blob = new Blob([response.data], {
                        type: 'application/pdf',
                    });

                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', 'output.pdf');
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                } catch (error) {
                    console.error('Error exporting data:', error);
                }
            }
        }

        if(choice === 'Export Selected'){
            if(fileType === 'Export Excel'){
                try {
                    const requestBody = {
                        items: selectedItems
                    };

                    const response = await axios.post(
                        'http://localhost:8000/api/stock/export/excel',
                        requestBody,
                        {
                            responseType: 'blob', // to handle binary data
                        }
                    );

                    const blob = new Blob([response.data], {
                        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    });

                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', 'output.xlsx');
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                } catch (error) {
                    console.error('Error exporting data:', error);
                }
            }

            if(fileType === 'Export PDF'){
                try {
                    const requestBody = {
                        items: selectedItems
                    };

                    const response = await axios.post(
                        'http://localhost:8000/api/stock/export/pdf',
                        requestBody,
                        {
                            responseType: 'blob', // to handle binary data
                        }
                    );

                    const blob = new Blob([response.data], {
                        type: 'application/pdf',
                    });

                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', 'output.pdf');
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                } catch (error) {
                    console.error('Error exporting data:', error);
                }
            }
        }
    };

    onMount(() => {
        setTimeout(() => {
            fadeIn = true;
        }, 50);

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
        border: 3px solid #d1dfdac5;
        border-radius: 50%;
        background-color: #ffffffc6;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.15s;
        font-size: 1.2em;
    }

    .toggle-button.selected {
        background-color: #ffffff;
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
        transform: translateY(-1px);
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

    .product-info {
        display: flex;
        align-items: center;
        gap: 10px;
        overflow-y: none;
    }

    .divider {
        width: 0.5px;
        height: 40px;
        background-color: #496d5a;
        margin-right: 1vw;
        scale: 1.4;
    }

    .trash-button {
        cursor: pointer;
        color: #ffffff;
        transition: transform 0.15s ease-in-out;
        font-size: 3vh;
        margin-right: 1vw;
        margin-left: 1.5vw;
    }

    .trash-button:hover {
        transform: scale(1.25);
        color: #de3933;
        animation: shake 0.75s ease-in-out infinite;
    }

    @keyframes shake {
        0%, 100% {
            transform: scale(1.25) rotate(0deg);
        }
        25% {
            transform: scale(1.25) rotate(-5deg);
        }
        50% {
            transform: scale(1.25) rotate(5deg);
        }
        75% {
            transform: scale(1.25) rotate(-5deg);
        }
    }


    .add-container {
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.3s ease, background-color 0.3s ease;
        width: 80px;
        height: 80px;
    }

    .add-container i {
        color: #496d5a; 
        font-size: 3.5em;
        transition: transform 0.1s ease;
    }

   .add-container:hover i {
        color: #72a58a;
        transform: scale(1.4) rotate(90deg);
    }


    .table-container {
        overflow-y: auto;
        max-height: 75vh; /* max height of the table container */
        margin-top: 3vh;
    }


    table {
        border-collapse: separate;
        border-spacing: 3px; /* adds space around the outside of cells */
        width: 100%;
    }

    th, td {
        padding: 15px;
        border: 1px solid #496d5a;
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

    .item-count {
        width: 50px;
        text-align: center;
        font-weight: bold;
        color: #d1dfdadb;
        background-color: transparent;
        border: none;
        font-size: 1em;
    }

    .total-count {
        width: 50px;
        font-weight: bold;
        color: #d1dfdadb;
        background-color: transparent;
        border: none;
        font-size: 1.5em;
    }

    tr:hover .item-count {
        color: #ffffff;
        scale: 1.15;
    }

    td input, td select {
        width: 100%;
        height: 40%;
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
        background-color: #dae9e4;
        color: #000603;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.2s ease-in-out;
    }

    .confirm-button:hover {
        background-color: #fff;
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

    .tick-icon {
        color: #176a3b;
        font-size: 1.5em;
        transition: opacity 0.3s;
    }
</style>

<div class="background {fadeIn ? 'fade-in' : ''}">
    <div class="background-wrapper {fadeIn ? 'fade-in' : ''}">
        <div class="background-overlay"></div>
        <div class="content {fadeIn ? 'fade-in' : ''} ml-[3vw] mr-[3vw] pl-[1.25vw] pr-[5vw]">

            <div class="total-count flex mt-[5vh] ml-[4vw]">
                <span>{products.length}</span>
                <span class="ml-[0.5vw] text-[0.8em]">total</span>
                <span class="ml-[0.5vw] text-[0.8em] mr-[2vw]">items</span>

                <span>{selectedCount}</span>
                <span class="ml-[0.5vw] text-[0.8em]">selected</span>
                <span class="ml-[0.5vw] text-[0.8em]">items</span>
            </div>

            <div class="table-container">
                <table class="table-compact w-full mt-[0vh] no-spacing">
                    <thead>
                        <tr>
                            <th class="item-count"></th>
                            <th on:click={toggleSelectAll} class="hover:cursor-pointer">Select</th>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Supplier</th>
                            <th>Frozen</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#if showAddRow}
                            <tr>
                                <td class="item-count"></td>
                                <td>
                                    <button on:click={addProduct} class="confirm-button">Add</button>
                                    <button class="cancel-button" on:click={cancelAddProduct}>Cancel</button>
                                </td>
                                <td><input type="text" bind:value={newProduct.Product} placeholder="Product" /></td>
                                <td><input type="text" bind:value={newProduct.Quantity} placeholder="Quantity" /></td>
                                <td><input type="text" bind:value={newProduct.Supplier} placeholder="Supplier" /></td>
                                <td>
                                    <select bind:value={newProduct.Frozen}>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                </td>
                            </tr>
                        {/if}

                        {#each products as product, index}
                            <tr class="spacing-x">
                                <td class="item-count">{index + 1}</td>
                                <td class="flex justify-center">
                                    <button
                                        class={`toggle-button ${selectedItems.includes(product.Product) ? 'selected' : ''}`}
                                        on:click={() => toggleSelection(product)}>
                                        {#if selectedItems.includes(product.Product)}
                                            <i class="bi bi-check-lg tick-icon"></i>
                                        {/if}
                                    </button>
                                </td>

                                <td class="flex-row justify-start font-semibold bg-[#26342c] rounded-lg pl-[2vw] border-[#000000] border-md">
                                    <div class="product-info">
                                        <i class="bi bi-trash3-fill trash-button" on:click={() => removeItem(product.Product)}></i>
                                        <div class="divider"></div>
                                        <span>{product.Product}</span>
                                    </div>
                                </td>

                                <td class="bg-[#26342c] rounded-lg border-[#000000] border-md">
                                    {product.Quantity}
                                </td>
                                <td class="bg-[#26342c] rounded-lg border-[#000000] border-md">
                                    <span class="badge" style="background-color: {getBadgeColor(product.Supplier)}">{product.Supplier}</span>
                                </td>
                                <td class="bg-[#26342c] rounded-lg border-[#000000] border-md">
                                    <span class="badge bg-[#0091eb]">{(product.Frozen == "Yes") ? "Frozen" : "Ambient"}</span>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>

            {#if !showAddRow}
                <div class="flex-buttons">
                    <div class="add-container mt-[0.5vh] ml-[4.8vw] fade-in hover:cursor-pointer" on:click={() => showAddRow = true}>
                        <i class="bi bi-file-plus rotate-90 text-[#d1dfda] scale-[1.25]"></i>
                    </div>

                    <div class="ml-[11vw] mt-[1vh]">
                        {#each ['Export All', 'Export View', 'Export Selected'] as e}
                            <button
                                class="chip {choice === e ? 'variant-filled' : 'variant-soft'} ml-[0.5vw]"
                                on:click={() => { choice = e; console.log(e) }}
                                on:keypress
                            >
                                {#if choice === e}(<span><i class="bi bi-check-lg tick-icon"></i></span>){/if}
                                <span>{e}</span>
                            </button>
                        {/each}
                    </div>

                    <div class="ml-[1vw] mt-[1vh]">
                        {#each ['Export Excel', 'Export PDF'] as f}
                            <button
                                class="chip {fileType === f ? 'variant-filled' : 'variant-soft'} ml-[0.5vw]"
                                on:click={() => { fileType = f; console.log(f)}}
                                on:keypress
                            >
                                {#if fileType === f}(<span><i class="bi bi-check-lg tick-icon"></i></span>){/if}
                                <span>{f}</span>
                            </button>
                        {/each}
                    </div>

                    <div class="ml-[5vw]">
                        <button class="confirm-button mt-[0.5vh] w-[9vw] font-semibold" on:click={confirmSave}>Save</button>
                        <button class="confirm-button mt-[0.5vh] w-[9vw] font-semibold" on:click={confirmExport}>Export</button>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>