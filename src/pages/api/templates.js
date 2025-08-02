// pages/api/settings/template.js

import { verify } from 'jsonwebtoken';
import prisma from '../../lib/prisma';

const SECRET_KEY = process.env.JWT_SECRET;

export default async function handler(req, res) {
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

  // Find the business associated with the user
  const business = await prisma.business.findUnique({ where: { userId } });
  if (!business) {
    return res.status(404).json({ message: 'Business not found for this user.' });
  }

  // --- GET Request: Fetch the current template setting ---
  if (req.method === 'GET') {
    try {
      const settings = await prisma.invoiceSetting.findUnique({
        where: { businessId: business.id },
        select: { templateName: true }, // Only select the field we need
      });
      // If settings don't exist, return the default
      if (!settings) {
        return res.status(200).json({ templateName: 'modern-blue' });
      }
      return res.status(200).json(settings);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to fetch template setting.' });
    }
  }

  // --- PUT Request: Update the template setting ---
  if (req.method === 'PUT') {
    try {
      const { templateName } = req.body;
      if (!templateName) {
        return res.status(400).json({ message: 'templateName is required.' });
      }

      const updatedSettings = await prisma.invoiceSetting.update({
        where: { businessId: business.id },
        data: { templateName: templateName },
      });
      return res.status(200).json(updatedSettings);
    } catch (error) {
      console.error("Template update error:", error);
      return res.status(500).json({ message: 'Failed to update template setting.' });
    }
  }

  // Handle other methods
  res.setHeader('Allow', ['GET', 'PUT']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}