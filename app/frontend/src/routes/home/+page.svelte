<script>
  import { onMount } from 'svelte';
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
    transform: translateY(-10px); /* lift the card slightly on hover */
    scale: 1.05;
  }
</style>

<div class="background {fadeIn ? 'fade-in' : ''}">
  <div class="background-wrapper {fadeIn ? 'fade-in' : ''}">
    <div class="background-overlay"></div>
    <div class="content {fadeIn ? 'fade-in' : ''} flex text-center justify-center items-center h-full bg-cover bg-center">
        
        <div class="flex btn-group-vertical h-[60vh]">
            <h1 class="text-xl text-center text-[7vh] mt-[2vh] font-serif">Home page</h1>
        </div>

    </div>
  </div>
</div>
