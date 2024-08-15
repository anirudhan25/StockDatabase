<script>
  import { goto } from "$app/navigation";

  let entered = ""; // variable to store the entered password

  const handleClick = () => {
    const password = "test_password123"; // Replace with your actual password
    if (entered === password) {
      goto("/home");
    } else {
      alert("Incorrect password. Please try again.");
    }
  };
</script>

<h1>Login page</h1>
<input type="password" placeholder="Enter your password" bind:value={entered} />
<button on:click={handleClick}>Log in</button>
