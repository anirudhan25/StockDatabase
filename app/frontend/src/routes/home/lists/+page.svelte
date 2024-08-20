<script>
  import { onMount } from 'svelte';
  import axios from 'axios';
  const url = 'http://localhost:8000/api/stock'
  let fadeIn = false;

  onMount(() => {
    setTimeout(() => {
      fadeIn = true;
    }, 100); // short delay to ensure the initial render completes
  });

  const onCardClick = (index) => {
    alert(`Clicked on ${suppliers[index]}`);
  }

  const suppliers = ["Bidfood", "Reynolds", "Birtwistles", "DeliceDeFrance", "DestinyFoods"];

  const getFromSupplier = (supplier) => {
    console.log(supplier);
    axios.get(`${url}/from/${supplier}`).then((response) => {
        // get items from a certain supplier
        const products = response.data;
        // const payload = {token, user: account};  /* use later when token is implemented */
        const payload = products.sort((a, b) => a.Product.localeCompare(b.Product));
        console.log(payload);
        // localStorage.setItem("user", JSON.stringify(payload));
        // dispatch({ type: "GET_FROM_SUPPLIER", payload: payload });  /* used to alert an update for the state reducer listener, use later if implemented */
    });
  }
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
  }

  .card:hover {
    background-color: #ffffff;
    transform: translateY(-10px);
    scale: 1.05;
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
    font-size: 3em; /* Increase the icon size */
    transition: transform 0.3s ease; /* Smooth scaling of the icon */
}

.icon-container:hover i {
    color: #ffffff; 
    transform: scale(1.1); /* Scale the icon itself on hover */
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
                    <div class="mt-[9vh] snap-start shrink-0 card py-20 w-40 md:w-80 text-center text-[4vh] font-semibold font-serif" on:click={() => getFromSupplier(suppliers[i])}>
                        {supplier}
                    </div>
                {/each}
                <div class="mt-[14.5vh] snap-start shrink-0 icon-container">
                    <i class="bi bi-plus-circle-fill"></i>
                </div>
            </div>
        </div>

    </div>
  </div>
</div>
