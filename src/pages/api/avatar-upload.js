import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  // Ensure this API route only accepts POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { filename, base64 } = req.body;
    
    if (!filename || !base64) {
      return res.status(400).json({ message: 'Missing file data (filename or base64)' });
    }

    // Remove the data URL scheme (e.g., "data:image/png;base64,")
    const base64Data = base64.split(',')[1];
    
    if (!base64Data) {
      return res.status(400).json({ message: 'Invalid base64 string' });
    }

    // Convert base64 string to a Buffer
    const buffer = Buffer.from(base64Data, 'base64');

    // Upload the buffer to Vercel Blob
    const blob = await put(filename, buffer, {
      access: 'public',
      addRandomSuffix: true, 
    });

    // Respond with the blob object, which contains the new, unique public URL
    return res.status(200).json(blob);

  } catch (error) {
    console.error("Vercel Blob Upload Error:", error);
    // Return a specific error message to the client
    return res.status(500).json({ 
      message: `Failed to upload file: ${error.message || 'Unknown error.'}` 
    });
  }
}