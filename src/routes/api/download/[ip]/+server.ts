import type { RequestHandler } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

export const GET: RequestHandler = async ({ params }) => {
	const { ip } = params;
	const port = 5000; // Default port, adjust if needed

	if (!ip) {
		return new Response(JSON.stringify({ success: false, error: 'No IP provided' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const cameraUrl = `http://${ip}:${port}/download`;

	try {
		const response = await fetch(cameraUrl);

		if (!response.ok) {
			return new Response(
				JSON.stringify({ success: false, error: 'Failed to fetch video from camera' }),
				{
					status: 502,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}

		const data = await response.json();

		// Download the video file using the provided download_url
		const videoResponse = await fetch(data.download_url);
		if (!videoResponse.ok) {
			return new Response(
				JSON.stringify({ success: false, error: 'Failed to download video file' }),
				{
					status: 502,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}
		const arrayBuffer = await videoResponse.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Ensure the videos directory exists
		const videosDir = path.resolve('videos');
		fs.mkdirSync(videosDir, { recursive: true });

		// Save the video file
		const filePath = path.join(videosDir, `${ip}_video.mp4`);
		fs.writeFileSync(filePath, buffer);

		// Append the timestamps to a global CSV file
		const timestamps = data.timestamps || {};
		const recordingsCsvPath = path.join(videosDir, 'recordings.csv');
		const csvHeader = 'ip,start,stop\n';
		const csvRow = `${ip},${timestamps.start || ''},${timestamps.stop || ''}\n`;

		// If the CSV doesn't exist, write the header first
		if (!fs.existsSync(recordingsCsvPath)) {
			fs.writeFileSync(recordingsCsvPath, csvHeader);
		}
		fs.appendFileSync(recordingsCsvPath, csvRow);

		return new Response(JSON.stringify({ success: true, filePath, recordingsCsvPath }), {
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
