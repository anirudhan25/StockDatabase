<script>
  import { onMount } from 'svelte';

  let fadeIn = false;

  onMount(() => {
    setTimeout(() => {
      fadeIn = true;
    }, 50); // short delay to ensure the initial render completes
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
    overflow: hidden; /* hide overflow from the blur effect */
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
    transition: opacity 1.25s ease-in-out;
  }

  .fade-in {
    opacity: 1;
  }
</style>

<div class="background {fadeIn ? 'fade-in' : ''}">
  <div class="background-wrapper {fadeIn ? 'fade-in' : ''}">
    <div class="background-overlay"></div>
    <div class="content {fadeIn ? 'fade-in' : ''} flex text-center justify-center items-center h-full bg-cover bg-center">
      <h1 class="text-xl text-center text-[8vh]">Home Page</h1>
    </div>
  </div>
</div>
