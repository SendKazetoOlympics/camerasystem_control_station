<!-- Make a text field that take text as ip input and set a button to send a request to it -->

<script lang="ts">
    import { onMount } from 'svelte';
    import { io } from 'socket.io-client';

    let ips = $state([]);

    const socket = io("http://localhost:5000");

    function addIP() {
        const ip = document.getElementById('ip').value;
        ips.push(ip);
        ips = [...new Set(ips)];
        console.log(ips);
    }


</script>

<!-- Add two buttons, one for adding an entry for IP and another for deleting -->
<button class='btn' onclick={addIP}>Add</button>
<button class='btn' id="delete">Delete</button>

<!-- Add a text field for IP address -->
<input type="text" id="ip" placeholder="Enter IP Address">


<!-- Display the list of IP addresses -->
<ul>
    {#each ips as ip}
        <li>{ip}</li>
    {/each}
</ul>

<button class='btn' id="ping">Ping</button>
<button class='btn' id="start">Start</button>
<button class='btn' id="stop">Stop</button>
<button class='btn' id="Download">Download</button>