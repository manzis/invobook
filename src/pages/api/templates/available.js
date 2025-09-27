import { verify } from 'jsonwebtoken';
import prisma from '../../../lib/prisma'; // Make sure this path is correct for your project structure

const SECRET_KEY = process.env.JWT_SECRET;

// Define the default templates available to all users.
// We set `imageUrl` to null because their previews are handled by CSS classes in the frontend.
const defaultTemplates = [
  { id: 'modern-blue', name: 'Modern Blue', imageUrl: null, isCustom: false },
  { id: 'modern-green', name: 'Modern Green', imageUrl: null, isCustom: false },
  { id: 'classic-tabular', name: 'Classic Black', imageUrl: null, isCustom: false },
];

export default async function handler(req, res) {
  // Only allow GET requests to this endpoint
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // 1. Authenticate the user from the cookie
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

  try {
    // 2. Fetch the user's custom templates AND their related business logo
    // This query efficiently fetches the template assignment and includes the logoUrl
    // from the user's associated business, if it exists.
    const customTemplatesFromDb = await prisma.customTemplate.findMany({
      where: { userId: userId },
      include: {
        user: {
          include: {
            business: {
              select: { // We only select the logoUrl to keep the data payload small
                logoUrl: true,
              },
            },
          },
        },
      },
    });

    // 3. Format the custom templates data for the frontend
    // This loop transforms the database data into the structure the frontend component expects.
    const userSpecificTemplates = customTemplatesFromDb.map(t => {
      // Safely access the logoUrl using optional chaining (?.)
      // This prevents errors if a user or business relationship doesn't exist.
      const businessLogo = t.user?.business?.logoUrl;

      return {
        id: t.templateName,
        name: t.templateName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        // The imageUrl is now the dynamic business logo.
        // It will be null if the business has no logo, and the frontend will show a fallback.
        imageUrl: businessLogo, 
        isCustom: true,
      };
    });

    // 4. Combine the default templates with the user's specific templates
    const availableTemplates = [...defaultTemplates, ...userSpecificTemplates];

    // 5. Send the final, combined list to the client
    return res.status(200).json(availableTemplates);

  } catch (error) {
    console.error("Failed to fetch available templates:", error);
    return res.status(500).json({ message: 'Failed to fetch available templates.' });
  }
}