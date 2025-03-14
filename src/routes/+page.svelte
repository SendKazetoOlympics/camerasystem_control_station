<!-- Make a text field that take text as ip input and set a button to send a request to it -->

<script lang="ts">
    import { CameraConnection } from '$lib/CameraConnection.svelte';

    let connections: CameraConnection[] = $state([]);
    const status = $derived.by(() => connections.map((connection) => connection.status));

    function addIP() {
        const ip: string = (document.getElementById('ip') as HTMLInputElement).value;
        connections.push(new CameraConnection(ip, 5000));
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

    function start_recording() {
        connections.forEach((connection) => {
            connection.startRecording();
        });
    }

    function stop_recording() {
        connections.forEach((connection) => {
            connection.stopRecording();
        });
    }

    function download() {
        connections.forEach((connection) => {
            fetch(`http://${connection.ip_address + ':' + connection.port}/download`)
                .then((response) => response.blob())
                .then((blob) => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = connection.ip_address + '_video.mp4';
                    a.click();
                });
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
    {#each connections as connection, i}
        <li>{connection.ip_address} {status[i].status} {status[i].timestamp}</li>
    {/each}
</ul>



<button class='btn' id="start" onclick={start_recording}>Start</button>
<button class='btn' id="stop" onclick={stop_recording}>Stop</button>
<button class='btn' id="Download" onclick={download}>Download</button>

