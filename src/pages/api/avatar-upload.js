// /pages/api/avatar-upload.js (Corrected and Final)

import { put } from '@vercel/blob';

// Disable the default Next.js body parser to handle the raw file stream
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Ensure this API route only accepts POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // The filename is passed as a query parameter from the frontend
  const filename = req.query.filename || 'untitled-file';

  try {
    // The `req` object itself is the stream in the Pages Router
    const blob = await put(filename, req, {
      access: 'public',
      
      // --- THIS IS THE FIX ---
      // Tell Vercel Blob to automatically add a unique random suffix
      // to the filename. This prevents overwrites and is the best practice
      // for user-uploaded content.
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