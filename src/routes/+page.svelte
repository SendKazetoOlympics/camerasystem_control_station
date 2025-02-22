<!-- Make a text field that take text as ip input and set a button to send a request to it -->

<script lang="ts">
    import { io, Socket } from 'socket.io-client';
    import { CameraConnection } from '$lib/CameraConnection';

    let ips: string[] = $state([]);
    let connections: CameraConnection[] = $state([]);

    function addIP() {
        const ip: string = (document.getElementById('ip') as HTMLInputElement).value;
        ips.push(ip);
        ips = [...new Set(ips)];
        connections.push(new CameraConnection(ip));
    }

    function start_ping() {
        connections.forEach((connection) => {
            connection.startHeartbeat();
        });
    }

    function stop_ping() {
        connections.forEach((connection) => {
            connection.stopHeartbeat();
        });
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



<button class='btn' id="start" onclick={start_ping}>Start</button>
<button class='btn' id="stop" onclick={stop_ping}>Stop</button>
<button class='btn' id="Download">Download</button>

