<script>
  import { goto } from "$app/navigation";

  let password = "";

  const handleClick = (e) => {
    e.preventDefault();
    const correctPassword = "test_password123"; // Replace with your actual password
    if (password === correctPassword) {
      goto("/home");
    } else {
      alert("Incorrect password. Please try again.");
    }
  };
</script>

<div class="flex justify-center items-center h-screen bg-[#004848]">
  <div class="bg-white border border-neutral-200 text-center h-[30vh] w-[30vw] p-[5vh_5vw] shadow-md rounded-lg">
    <h1 class="text-[3vw] font-bold mb-[2vh] text-black">Log in</h1>

    <form class="flex flex-col items-center p-0 w-[20vw] h-[14vh] mt-[5vh]" on:submit|preventDefault={handleClick}>
      <input
        class="w-full h-[6vh] rounded-[14px] border border-gray-300 mb-[4vh] pl-[2vw] shadow-sm text-[1.5vw] text-gray-900 focus:outline-none focus:ring-0 focus:border-gray-400"
        type="password"
        placeholder="Password"
        bind:value={password}
      />
      <button class="bg-black text-white w-[60%] h-[6vh] rounded-2xl cursor-pointer text-[1.5vw] hover:bg-gray-800">
        Enter
      </button>
    </form>
  </div>
</div>