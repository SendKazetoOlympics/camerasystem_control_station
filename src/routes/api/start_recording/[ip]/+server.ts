import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
	const { ip } = params;
	const port = 5000;

	if (!ip) {
		return new Response(JSON.stringify({ success: false, error: 'No IP provided' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const cameraUrl = `http://${ip}:${port}/start-recording`;

	try {
		const response = await fetch(cameraUrl, { method: 'POST' });

		if (!response.ok) {
			return new Response(JSON.stringify({ success: false, error: 'Failed to start recording' }), {
				status: 502,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error: unknown) {
		let message = 'Unknown error';
		if (error instanceof Error) {
			message = error.message;
		}
		return new Response(JSON.stringify({ success: false, error: message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};
