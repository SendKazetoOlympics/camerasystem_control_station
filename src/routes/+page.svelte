<!-- Make a text field that take text as ip input and set a button to send a request to it -->

<script lang="ts">
	import { CameraConnection } from '$lib/CameraConnection.svelte';
	import { onMount } from 'svelte';

	let connections: CameraConnection[] = $state([]);
	const status = $derived.by(() => connections.map((connection) => connection.status));

	let messages: string[] = $state([]);

	function deleteConnection(index: number) {
		const conn = connections[index];
		if (conn) {
			conn.disconnect();
			connections.splice(index, 1);
		}
	}

	function clearMessages() {
		messages = [];
	}

	function addMessage(msg: string) {
		messages = [...messages, msg];
	}

	function addIP() {
		const ip: string = (document.getElementById('ip') as HTMLInputElement).value;
		connections.push(new CameraConnection(ip, 5000, addMessage));
	}

	function start_ping() {
		connections.forEach((connection) => {
			connection.startHeartbeat();
		});
		addMessage('Started ping for all cameras.');
	}

	function stop_ping() {
		connections.forEach((connection) => {
			connection.stopHeartbeat();
		});
		addMessage('Stopped ping for all cameras.');
	}

	function start_recording() {
		connections.forEach((connection) => {
			connection.startRecording();
		});
		addMessage('Started recording for all cameras.');
	}

	function stop_recording() {
		connections.forEach((connection) => {
			connection.stopRecording();
		});
		addMessage('Stopped recording for all cameras.');
	}

	let runNumber = $state(1);

	function download() {
		connections.forEach((connection) => {
			fetch(`/api/download/${connection.ip_address}?run=${runNumber}`)
				.then((response) => response.json())
				.then((data) => {
					if (data.success) {
						addMessage(`Saved video for ${connection.ip_address} at ${data.filePath}`);
					} else {
						addMessage(
							`Failed to save video for ${connection.ip_address}: ${data.error || 'Unknown error'}`
						);
					}
				})
				.catch((err) => {
					addMessage(`Error saving video for ${connection.ip_address}: ${err.message}`);
				});
		});
		runNumber += 1;
	}

	function start_calibration() {
		connections.forEach((connection) => {
			fetch(`http://${connection.ip_address}:5000/start_mediamtx`, {
				method: 'POST'
			})
				.then((response) => response.json())
				.then((data) => {
					if (data.status === 'started' || data.status === 'already running') {
						addMessage(`Calibration started for ${connection.ip_address}`);
					} else {
						addMessage(
							`Failed to start calibration for ${connection.ip_address}: ${data.error || data.status}`
						);
					}
				})
				.catch((err) => {
					addMessage(`Error starting calibration for ${connection.ip_address}: ${err.message}`);
				});
		});
	}

	function stop_calibration() {
		connections.forEach((connection) => {
			fetch(`http://${connection.ip_address}:5000/stop_mediamtx`, {
				method: 'POST'
			})
				.then((response) => response.json())
				.then((data) => {
					if (data.status === 'stopped' || data.status === 'not running') {
						addMessage(`Calibration stopped for ${connection.ip_address}`);
					} else {
						addMessage(
							`Failed to stop calibration for ${connection.ip_address}: ${data.error || data.status}`
						);
					}
				})
				.catch((err) => {
					addMessage(`Error stopping calibration for ${connection.ip_address}: ${err.message}`);
				});
		});
	}

	function on_key_down(event: KeyboardEvent) {
	console.log(`Key pressed: ${event.key}`);
      // Prevent default browser behavior (e.g., scrolling with arrow keys)
      event.preventDefault();
	}

	onMount(() => {
		connections.push(new CameraConnection('192.168.0.101', 5000, addMessage));
		connections.push(new CameraConnection('192.168.0.102', 5000, addMessage));
		connections.push(new CameraConnection('192.168.0.103', 5000, addMessage));
	});
</script>

<svelte:window onkeydown={on_key_down} />

<!-- Add button for adding an entry for IP -->
<button class="btn" onclick={addIP}>Add</button>

<!-- Add a text field for IP address -->
<input type="text" id="ip" placeholder="Enter IP Address" />

<!-- Display the list of IP addresses and their current timestamp, with a delete button for each -->
<ul>
	{#each connections as connection, i}
		<li>
			{connection.ip_address}
			{status[i].status}
			<!-- Display timestamp as unix time (milliseconds since epoch) -->
			{status[i].timestamp}
			<button class="btn" onclick={() => deleteConnection(i)}>Delete</button>
		</li>
	{/each}
</ul>

<button class="btn" onclick={start_ping}>Start Ping</button>
<button class="btn" onclick={stop_ping}>Stop Ping</button>
<button class="btn" id="start" onclick={start_recording}>Start</button>
<button class="btn" id="stop" onclick={stop_recording}>Stop</button>
<button class="btn" id="start-calibration" onclick={start_calibration}>Start Calibration</button>
<button class="btn" id="stop-calibration" onclick={stop_calibration}>Stop Calibration</button>

<!-- Show the current run number (read-only) -->
<div style="margin: 1em 0; font-weight: bold;">
	Current Run Number: {runNumber}
</div>

<button class="btn" id="Download" onclick={download}>Download</button>

<!-- Status messages area -->
<div style="margin: 1em 0;">
	<button class="btn" onclick={clearMessages} style="margin-bottom: 0.5em;">Clear Messages</button>
	{#each messages as msg}
		<div>{msg}</div>
	{/each}
</div>
