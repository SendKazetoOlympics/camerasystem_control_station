<!-- Make a text field that take text as ip input and set a button to send a request to it -->

<script lang="ts">
    import { io, Socket } from 'socket.io-client';
    import { CameraConnection } from '$lib/CameraConnection';

    let ips: string[] = $state([]);
    let sockets: Socket[] = $state([]);

    function addIP() {
        const ip: string = (document.getElementById('ip') as HTMLInputElement).value;
        ips.push(ip);
        ips = [...new Set(ips)];
        sockets.push(io(ip));
    }

    function start_ping() {
        sockets.forEach((socket) => {
            setInterval(() => {
                const start = Date.now();
                socket.emit('ping', () => {
                    const duration = Date.now() - start;
                    console.log(duration);
                });
            }, 1000);
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



<button class='btn' id="start">Start</button>
<button class='btn' id="stop">Stop</button>
<button class='btn' id="Download">Download</button>

