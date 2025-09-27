import { verify } from 'jsonwebtoken';
import prisma from '../../../lib/prisma';

const SECRET_KEY = process.env.JWT_SECRET;

export default async function handler(req, res) {
  // This endpoint only accepts DELETE requests
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // 1. Authenticate the user
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

  // 2. Get and validate the input from the request body
  const { templateName } = req.body;
  if (!templateName) {
    return res.status(400).json({ message: 'Template name is required.' });
  }

  try {
    // 3. Delete the assignment using the unique constraint.
    // This is secure because it requires both the user's ID and the template name,
    // ensuring a user can only delete their own assignments.
    await prisma.customTemplate.delete({
      where: {
        userId_templateName: {
          userId: userId,
          templateName: templateName,
        },
      },
    });

    return res.status(200).json({ message: 'Template removed successfully.' });

  } catch (error) {
    // Prisma throws an error (P2025) if the record to delete is not found, which is fine.
    console.error("Failed to unassign custom template:", error);
    return res.status(500).json({ message: 'An error occurred on the server.' });
  }
}