<script>
  import { onMount } from 'svelte';
  import axios from 'axios';
  import { goto } from "$app/navigation"; 

  const url = 'http://localhost:8000/api/stock';
  let fadeIn = false;

  const suppliers = ["Bidfood", "Reynolds", "Birtwistles", "DeliceDeFrance", "DestinyFoods"];
  let listCounts = Array(suppliers.length).fill(0); // init with 0 for each supplier

  onMount(() => {
    setTimeout(() => {
      fadeIn = true;
    }, 100); // short delay to ensure the initial render completes

    suppliers.forEach((supplier, index) => {
      getListCount(supplier, index);
    });
  });

  const getListCount = (supplier, index) => {
    axios.get(`${url}/from/${supplier}`).then((response) => {
      listCounts = [...listCounts];
      listCounts[index] = response.data.length; // update the count
    }).catch(error => {
      console.error(`Error fetching count for ${supplier}:`, error);
      listCounts[index] = 0; // handle errors by setting the count to 0
    });
  };

  const onCardClick = (list) => {
    goto(`/home/lists/${list}`);
  };
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
  }

  .fade-in {
    opacity: 1;
  }

  .card {
    background-color: #d1dfda; /* background color of the card */
    color: #174b2e; /* text color */
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, background-color 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .card:hover {
    background-color: #ffffff;
    transform: translateY(-10px);
    scale: 1.05;
  }

  .badge {
    margin-top: 2.5vh;
    padding: 7px 13px;
    background-color: #174b2e;
    color: #d1dfda;
    border-radius: 1vw;
    font-size: 2.2vh;
    font-family: Arial;
    letter-spacing: 0.5px;
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

</style>

<div class="background {fadeIn ? 'fade-in' : ''}">
  <div class="background-wrapper {fadeIn ? 'fade-in' : ''}">
    <div class="background-overlay"></div>
    <div class="content {fadeIn ? 'fade-in' : ''} flex text-center justify-center items-center h-full bg-cover bg-center">
        
      <div class="flex btn-group-vertical h-[60vh]">
        <h1 class="text-2xl text-center text-[8vh] mt-[2vh] font-serif">Your lists</h1>

        <div class="snap-x scroll-px-4 snap-mandatory scroll-smooth flex gap-5 overflow-x-auto px-4 py-10 w-[90vw] border-none">
          {#each suppliers as supplier, i}
            <div class="card mt-[9vh] snap-start shrink-0 py-20 w-40 md:w-80 text-center text-[4vh] font-semibold font-serif" on:click={() => onCardClick(supplier)}>
              <div>{supplier}</div>
              <span class="badge">{listCounts[i]}</span>
            </div>
          {/each}
          <div class="mt-[17.5vh] snap-start shrink-0 icon-container">
            <i class="bi bi-plus-circle-fill"></i>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>