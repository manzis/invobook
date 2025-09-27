import { verify } from 'jsonwebtoken';
import prisma from '../../../lib/prisma';

const SECRET_KEY = process.env.JWT_SECRET;

// --- NEW: This is your master key-to-template map ---
// The key is the secret code the user will enter.
// The value is the actual template name that corresponds to a file and the PDF generator map.
const TEMPLATE_KEY_MAP = {
  'BE-1024-8907-5670': 'bhagwan-essential',
  // You can easily add more keys and templates in the future
  // 'ACME-CORP-PREMIUM': 'acme-corp-red',
  // 'GX-DARK-2025-KEY': 'galaxy-dark',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // 1. Authentication (remains the same)
  const { authToken } = req.cookies;
  if (!authToken) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  let userId;
  try {
    const decoded = verify(authToken, SECRET_KEY);
    userId = decoded.userId;
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token.' });
  }

  // 2. Get the KEY from the request and validate it
  const { templateKey } = req.body; // We expect a 'templateKey' from the frontend
  if (!templateKey) {
    return res.status(400).json({ message: 'A template key is required.' });
  }

  // --- NEW: Look up the key in our map to get the real template name ---
  const templateNameToAssign = TEMPLATE_KEY_MAP[templateKey];

  // If the key doesn't exist in our map, it's invalid.
  if (!templateNameToAssign) {
    return res.status(400).json({ message: 'Invalid or unrecognized template key.' });
  }

  try {
    // 3. Check if the user already has this template assigned (using the REAL name)
    const existingAssignment = await prisma.customTemplate.findUnique({
      where: {
        userId_templateName: {
          userId: userId,
          templateName: templateNameToAssign, // Check against the resolved template name
        },
      },
    });

    if (existingAssignment) {
      return res.status(409).json({ message: 'This template is already added to your account.' });
    }

    // 4. Create the new assignment, saving the REAL template name to the DB
    const newTemplate = await prisma.customTemplate.create({
      data: {
        userId: userId,
        templateName: templateNameToAssign, // Save the correct template name
      },
    });

    return res.status(201).json({ message: 'Template added successfully!', template: newTemplate });

  } catch (error) {
    console.error("Failed to assign custom template:", error);
    return res.status(500).json({ message: 'An error occurred on the server.' });
  }
}