<!-- Make a text field that take text as ip input and set a button to send a request to it -->

<script>
    import { onMount } from 'svelte';
    onMount(() => {
        const ping = document.getElementById('ping');
        const ip = document.getElementById('ip');
        ping.addEventListener('click', () => {
        fetch(`http://localhost:5000/start`)
            .then(res => res.json())
            .then(data => {
            console.log(data.message);
            })
            .catch(err => {
            console.log(err);
            });
        });
    });
</script>


<input type="text" id="ip" placeholder="Enter IP Address">
<button id="ping">Ping</button>