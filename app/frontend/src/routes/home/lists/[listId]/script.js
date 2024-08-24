import { onMount } from 'svelte';
import axios from 'axios';
import { page } from '$app/stores';

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
    const productId = product.Product;
    const index = selectedItems.indexOf(productId);

    if (index === -1) {
        selectedCount++;
        selectedItems = [...selectedItems, productId];
    } else {
        selectedCount--;
        selectedItems = selectedItems.filter((item) => item !== productId);
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
    const confirmSave = window.confirm("Are you sure you want to save changes?");
    if (confirmSave) {
        await updateDatabase();
    }
};

const confirmExport = async () => {
    if (addedItems.length > 0 || removedItems.length > 0) {
        const confirmExport = window.confirm("You have unsaved changes. Save before exporting?");
        if (confirmExport) {
            await updateDatabase();
        }
    }
    alert('Exporting data...');

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

};

onMount(() => {
    setTimeout(() => {
        fadeIn = true;
    }, 100);

    getFromSupplier();
});