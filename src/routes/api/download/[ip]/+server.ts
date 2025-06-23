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
            return new Response(JSON.stringify({ success: false, error: 'Failed to fetch video from camera' }), {
                status: 502,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Ensure the videos directory exists
        const videosDir = path.resolve('videos');
        fs.mkdirSync(videosDir, { recursive: true });

        // Save the file
        const filePath = path.join(videosDir, `${ip}_video.mp4`);
        fs.writeFileSync(filePath, buffer);

        return new Response(JSON.stringify({ success: true, filePath }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
