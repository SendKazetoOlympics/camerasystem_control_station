<!-- Make a text field that take text as ip input and set a button to send a request to it -->

<script lang="ts">
    import { onMount } from 'svelte';

    let ips = $state([]);

    function addIP() {
        const ip = document.getElementById('ip').value;
        ips.push(ip);
        console.log(ips);
    }


</script>

<!-- Add two buttons, one for adding an entry for IP and another for deleting -->
<button class='btn' onclick={addIP}>Add</button>
<button class='btn' id="delete">Delete</button>

<!-- Add a text field for IP address -->
<input type="text" id="ip" placeholder="Enter IP Address">

<!-- Add a button for pinging the IP address -->
<button id="ping">Ping</button>

<!-- Display the list of IP addresses -->
<ul>
    {#each ips as ip}
        <li>{ip}</li>
    {/each}
</ul>