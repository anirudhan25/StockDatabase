<script>
    import { onMount } from 'svelte';
    import axios from 'axios';
    import { page } from '$app/stores';
    import { getModalStore } from '@skeletonlabs/skeleton';
    const modalStore = getModalStore();

    const listId = $page.params.listId;
    const url = 'http://localhost:8000/api/stock';

    let products = [];
    let filtered = [];
    let fadeIn = false;
    let selectedItems = [];
    let selectedItemIds = [];
    let addedItems = [];
    let removedItems = [];
    let selectedCount = 0;

    let frozenFilterCount = 0;
    let frozenFilter = 'Frozen';
    const suppliers = ["Bidfood", "Reynolds", "Birtwistles", "DeliceDeFrance", "DestinyFoods"];
    const supplierColors = {
        Bidfood: '#d42000',
        Reynolds: '#FF5733',
        Birtwistles: '#4e0b58',
        DeliceDeFrance: '#1d43da',
        DestinyFoods: '#3299c5'
    };
    const supplierFilters = { 
        Bidfood: false,
        Reynolds: false,
        Birtwistles: false,
        DeliceDeFrance: false,
        DestinyFoods: false
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
            products.forEach(item => {
                if(item.selected){
                    selectedItems.push(item.Product);
                    selectedItemIds.push(item.id);
                }
            });
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const removeItem = async (productName) => {
        console.log(`removing: ${productName}`);
        try {
            const item = products.find(product => product.Product === productName);
            let index = -1;
            if (item.selected) {
                index = selectedItems.indexOf(productName);
                if (index > -1) {
                    selectedCount--;
                    selectedItems = [
                        ...selectedItems.slice(0, index),
                        ...selectedItems.slice(index + 1)
                    ];
                    selectedItemIds = [
                        ...selectedItemIds.slice(0, index),
                        ...selectedItemIds.slice(index + 1)
                    ];
                }
            }

            let product = {};
            // remove item from products and filtered arrays
            product = products.find(p => p.Product === productName);
            index = products.indexOf(product);
            if (index > -1) {
                products = [
                    ...products.slice(0, index),
                    ...products.slice(index + 1)
                ];
            }

            product = filtered.find(p => p.Product === productName);
            index = filtered.indexOf(product);
            if (index > -1) {
                filtered = [
                    ...filtered.slice(0, index),
                    ...filtered.slice(index + 1)
                ];
            }

            // keep track of newly removed items
            removedItems.push(item);

            // remove from addedItems if it was added during this session
            if (addedItems.some(new_item => new_item.Product === item.Product)) {
                addedItems = addedItems.filter(new_item => new_item.Product !== item.Product);
            }

        } catch (error) {
            console.error('Error removing item:', error);
        }
    };


    const toggleSelection = (product) => {
        const productId = product.id;
        const productName = product.Product;

        // update the selected state of the product in the array (reflect in UI)
        products = products.map(p =>
            p.id === productId ? { ...p, selected: !p.selected } : p
        );
        filtered = filtered.map(p =>
            p.id === productId ? { ...p, selected: !p.selected } : p
        );

        // update selectedItems list and selectedCount accordingly
        const selectedItem = products.find(p => p.id === productId);
        if (selectedItem.selected) {
            selectedCount++;
            selectedItems = [...selectedItems, productName];
            selectedItemIds = [...selectedItemIds, selectedItem.id];
        } else {
            const index = selectedItems.indexOf(productName);
            if (index > -1) {
                selectedCount--;
                selectedItems = [
                    ...selectedItems.slice(0, index),
                    ...selectedItems.slice(index + 1)
                ];

                selectedItemIds = [
                    ...selectedItems.slice(0, index),
                    ...selectedItems.slice(index + 1)
                ];
            }
        }
    };





    const toggleSelectAll = () => {
        if (selectedCount > 0) {
            selectedCount = 0;
            selectedItems = [];
            selectedItemIds = [];
            products.forEach(item => item.selected = false);
        } else {
            selectedCount = products.length;
            selectedItems = products.map(product => product.Product);
            selectedItemIds = products.map(product => product.Product);
            products.forEach(item => item.selected = true);
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
            filtered = [newProduct, ...filtered];
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
                toRemove: removedItems,
                selectedChanges: selectedItems

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
            // selectedItems = [];
        } catch (error) {
            console.error('Unexpected error:', error);
        }
    };

    let saveStatus = '';
    const confirmSave = async () => {
        const modal = {
            type: 'confirm',
            title: 'Save changes',
            body: 'Are you sure you wish to save all changes made?',
            response: async (r) => {
                if (r) {
                    console.log('saving...');
                    try {
                        await updateDatabase();
                        saveStatus = 'success'; // set the status to success
                    } catch (error) {
                        console.error('Error during save:', error);
                        saveStatus = 'error'; // set the status to error if something goes wrong
                    } finally {
                        setTimeout(() => {
                            saveStatus = ''; // reset the status after a short delay
                        }, 1500);
                    }
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

    const suppliersFilterClick = (supplier) => {
        supplierFilters[supplier] = !supplierFilters[supplier];

        // filter on active suppliers
        const activeSuppliers = Object.keys(supplierFilters).filter(key => supplierFilters[key]);

        if (activeSuppliers.length > 0) {
            filtered = products.filter(item => activeSuppliers.includes(item.Supplier));
        } 
        else {
            filtered = products; // show all products if no filter
        }
    }


    const reverseProducts = () => {
        filtered = [...filtered].reverse();
    }

    const filterFrozen = () => {
        frozenFilterCount++;
        filtered = products;
        const activeSuppliers = Object.keys(supplierFilters).filter(key => supplierFilters[key]);

        if (activeSuppliers.length > 0) {
            filtered = products.filter(item => activeSuppliers.includes(item.Supplier));
        } else {
            filtered = products;
        }
        
        if(frozenFilterCount == 4){
            frozenFilterCount = 0;
            return;
        }

        if (frozenFilter === 'Frozen') {
            frozenFilter = 'Chilled';
        } 
        else if (frozenFilter === 'Chilled') {
            frozenFilter = 'Ambient';
        } 
        else {
            frozenFilter = 'Frozen';
        }

        // cannot apply multiple filters without overfiltering if using filtered instead of products
        // if a filter returns no items, it's saved and you cannot filter back to it
        filtered = filtered.filter(item => {
            if (frozenFilter === 'Ambient') {
                return item.Frozen === 'No';
            } else if (frozenFilter === 'Chilled') {
                return item.Frozen === 'Chilled';
            } else {
                return item.Frozen === 'Yes';
            }
        });
    };



    onMount(async () => {
        setTimeout(() => {
            fadeIn = true;
        }, 50);

        await getFromSupplier();
        selectedCount = selectedItems.length;
        filtered = products;
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
        max-height: 99vh; /* max height to control the scrollable area */
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
        border-radius: 0.28vw;
        font-size: 2.1vh;
        font-family: Arial;
        letter-spacing: 0.5px;
        display: inline-block;
    }

    .filter-badge {
        margin: 0;
        padding: 4px 13px;
        border-radius: 0.28vw;
        font-size: 1.75vh;
        font-family: Arial;
        letter-spacing: 0.5px;
        display: inline-block;
        height: 4vh;
        cursor: pointer;
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
        font-size: 1.6rem;
        margin-right: 1vw;
        margin-left: 1.5vw;
    }

    .trash-button:hover {
        transform: scale(1.2);
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
        max-height: 73vh; /* max height of the table container */
        margin-top: 0vh;
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

    .confirm-button.success {
        background-color: #28a745;
        color: white;
    }

    .confirm-button.error {
        background-color: #dc3545;
        color: white;
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


    @media (max-width: 1000px) {
        .name {
            font-size: 0.8rem;
        }

        .table-container {
            width: 97vw;
            transform: translateX(-5.4vw);
        }

        .info {
            transform: translateX(-2.5vw);
        }

        th, td {
            line-height: 1;
            height: 55px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }

        .badge {
            margin: 0;
            padding: 3px 9px;
            border-radius: 0.28vw;
            font-size: 0.7rem;
            font-family: Arial;
            letter-spacing: 0.5px;
            display: inline-block;
        }

        .filter-badge {
            margin: 0;
            padding: 4px 13px;
            border-radius: 0.28vw;
            font-size: 0.7rem;
            font-family: Arial;
            letter-spacing: 0.5px;
            display: inline-block;
            height: 2rem;
            cursor: pointer;
            align-content: center;
        }

        .toggle-button {
            transform: scale(0.8) translateY(-12.5%);
        }

        .trash-button {
            transform: scale(0.9);
        }

        .divider {
            height: 30px;
            margin-right: 0.5vw;
            scale: 1.2;
        }

        .export {
            display: hidden;
        }
    }
</style>

<div class="background {fadeIn ? 'fade-in' : ''}">
    <div class="background-wrapper {fadeIn ? 'fade-in' : ''}">
        <div class="background-overlay"></div>
        <div class="content {fadeIn ? 'fade-in' : ''} ml-[3vw] mr-[3vw] pl-[1.25vw] pr-[5vw]">

            <div class="flex-col info">
                <div class="total-count flex mt-[3vh] ml-[4vw]">
                    <span class="text-[0.9em]">{filtered.length}</span>
                    <span class="ml-[0.5vw] text-[0.7em] mr-[2vw]">items</span>

                    <span class="text-[0.9em]">{selectedCount}</span>
                    <span class="ml-[0.5vw] text-[0.7em]">selected</span>
                    <span class="ml-[0.5vw] text-[0.7em]">items</span>
                </div>
                <div class="flex mt-[4vh]">
                    <i on:click={reverseProducts} class="bi bi-sort-alpha-down ml-[4vw] bg-[#26342c] backdrop-blur-md rounded-md hover:cursor-pointer px-[5px] py-[5px]" style="font-size: 40px; transform: translateY(-20%); border: 1px solid #496d5a;"></i>
                    <i on:click={filterFrozen} class="bi bi-snow ml-[1vw] bg-[#26342c] backdrop-blur-md rounded-md hover:cursor-pointer px-[5px] py-[5px]" style="font-size: 40px; transform: translateY(-20%); border: 1px solid #496d5a;"></i>
                    <div class="flex ml-[2vw] gap-[0.75vw]">
                        {#each suppliers as supplier}
                            {#if supplierFilters[supplier]}
                                <span class="filter-badge"
                                    style="background-color: {getBadgeColor(supplier)}"
                                    on:click={() => suppliersFilterClick(supplier)}>
                                    <i class="bi bi-x-lg mr-[0.35vw]"></i>{supplier}
                                </span>
                            {:else}
                                <span class="filter-badge"
                                    style="background-color: #222423"
                                    on:click={() => suppliersFilterClick(supplier)}>
                                    {supplier}
                                </span>
                            {/if}
                        {/each}
                    </div>
                </div>
            </div>

            <div class="table-container">
                <table class="table-traslate table-compact w-full no-spacing mt-[1vh]">
                    <thead>
                        <tr class="name">
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

                        {#each filtered as product, index}
                            <tr class="spacing-x">
                                <td class="item-count">{index + 1}</td>
                                <td class="flex justify-center">
                                    <button
                                        class={`toggle-button ${product.selected && selectedItemIds.includes(product.id)? 'selected' : ''}`}
                                        on:click={() => toggleSelection(product)}>
                                        {#if product.selected === true || selectedItemIds.includes(product.id)}
                                            <i class="bi bi-check-lg tick-icon tick"></i>
                                        {/if}
                                    </button>
                                </td>

                                <td class="name flex-row justify-start font-semibold bg-[#26342c] rounded-lg pl-[2vw] border-[#000000] border-md">
                                    <div class="product-info">
                                        <i class="bi bi-trash3-fill trash-button" on:click={() => removeItem(product.Product)}></i>
                                        <div class="divider"></div>
                                        <span>{product.Product}</span>
                                    </div>
                                </td>

                                <td class="name bg-[#26342c] rounded-lg border-[#000000] border-md">
                                    {product.Quantity}
                                </td>
                                <td class="bg-[#26342c] rounded-lg border-[#000000] border-md">
                                    <span class="badge" style="background-color: {getBadgeColor(product.Supplier)}">{product.Supplier}</span>
                                </td>
                                <td class="bg-[#26342c] rounded-lg border-[#000000] border-md px-0">
                                    <span class={(product.Frozen === "Yes")? "badge bg-[#0091eb] text-[#d1dfda]" : (product.Frozen === "Chilled")? "badge bg-[#59a8d8] text-white" : "badge bg-[#d1dfda] text-[#324c3f]"}>
                                        {(product.Frozen === "Yes") ? "Frozen" : (product.Frozen === "Chilled") ? "Chilled" : "Ambient"}
                                    </span>
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

                    <div class="ml-[11vw] export">
                        {#each ['Export All', 'Export View', 'Export Selected'] as e}
                            <button
                                class="chip {choice === e ? 'variant-filled' : 'variant-soft'} ml-[0.5vw]"
                                on:click={() => { choice = e}}
                                on:keypress
                            >
                                {#if choice === e}(<span><i class="bi bi-check-lg tick-icon"></i></span>){/if}
                                <span>{e}</span>
                            </button>
                        {/each}
                    </div>

                    <div class="ml-[1vw] export">
                        {#each ['Export Excel', 'Export PDF'] as f}
                            <button
                                class="chip {fileType === f ? 'variant-filled' : 'variant-soft'} ml-[0.5vw]"
                                on:click={() => { fileType = f}}
                                on:keypress
                            >
                                {#if fileType === f}(<span><i class="bi bi-check-lg tick-icon"></i></span>){/if}
                                <span>{f}</span>
                            </button>
                        {/each}
                    </div>

                    <div class="ml-[5vw]">
                        <button
                            class="confirm-button mt-[0.5vh] w-[9vw] font-semibold {saveStatus === 'success' ? 'success' : ''} {saveStatus === 'error' ? 'error' : ''}"
                            on:click={confirmSave}>
                            Save
                        </button>
                        <button class="confirm-button mt-[0.5vh] w-[9vw] font-semibold" on:click={confirmExport}>Export</button>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>