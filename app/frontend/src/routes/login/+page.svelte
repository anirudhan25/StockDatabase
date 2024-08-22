<script>
  import { goto } from "$app/navigation";
  import { fly } from "svelte/transition";
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { onMount } from 'svelte';

  let username = "";
  let password = "";
  let containerVisible = true;
  const opacity = tweened(1, { duration: 500, easing: cubicOut });
  let scale = 1;

  const handleClick = async (e) => {
    e.preventDefault();
    
    const correctUsername = "username";
    const correctPassword = "eduroam";
 
    if (password === correctPassword && username === correctUsername) {
      scale = 1.25;
      containerVisible = false;
      await opacity.set(0);
      goto("/home/lists/all");
    } else {
      username = "";
      password = "";
    }
  };

  onMount(() => {
    opacity.set(1);
  });
</script>

<style>
  .login-container {
    transition: transform 0.5s ease, opacity 0.5s ease;
  }
</style>

<div
  class="flex justify-start items-center h-screen bg-[#033839] bg-cover bg-center"
  style="background-image: url('/pexels-martinpechy-2078266.jpg');"
>
  {#if containerVisible}
    <div
      class="bg-white border border-neutral-200 text-center h-[100vh] w-[40vw] p-[5vh_5vw] shadow-md rounded-e-xl login-container"
      style="opacity: {$opacity}; transform: scale({scale});"
      in:fly={{ x: 200, duration: 500 }}
      out:fly={{ x: -200, duration: 500 }}
    >
      <h1 class="text-[3vw] mt-[4vh] text-black font-serif">Log in</h1>

      <form class="flex flex-col items-center p-0 w-full mt-[12vh]" on:submit|preventDefault={handleClick}>
        
        <h2 class="text-black text-lg mb-3 self-start text-[1.5vw] font-serif">Username</h2>
        <!-- container for person icon and username input field -->
        <div class="relative w-full">
          <i class="fas fa-user absolute left-3 top-[2.85vh] transform -translate-y-1/2 text-gray-500"></i>
          <input
            class="w-full h-[6vh] rounded-[14px] mb-[4vh] border-none text-[1.1vw] text-green-900 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-0 pl-[2.5rem]"
            placeholder="Enter your username"
            bind:value={username}
          />
        </div>

        <h2 class="text-black text-lg mb-3 self-start text-[1.5vw] font-serif">Password</h2>
        <!-- container for lock icon and password input field -->
        <div class="relative w-full">
          <i class="fas fa-lock absolute left-3 top-[2.85vh] transform -translate-y-1/2 text-gray-500"></i>
          <input
            class="w-full h-[6vh] rounded-[14px] mb-[4vh] border-none text-[1.1vw] text-green-900 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-0 pl-[2.5rem]"
            type="password"
            placeholder="Enter your password"
            bind:value={password}
          />
        </div>
        
        <button class="bg-black text-white mt-[1.8vh] h-[5vh] w-[29vw] rounded-md cursor-pointer text-[1.5vw] hover:bg-[#1d5d39] font-sans">
          Enter
        </button>
      </form>
    </div>
  {/if}
</div>
