import { verify } from 'jsonwebtoken';
import prisma from '../../lib/prisma';
import { createNotification } from '../../lib/notifications';

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

  // --- GET: Fetch notifications and perform dynamic overdue check ---
  if (req.method === 'GET') {
    try {
      // 1. Dynamic Overdue Scan
      const now = new Date();
      const pendingOverdueInvoices = await prisma.invoice.findMany({
        where: {
          userId: userId,
          status: 'PENDING',
          dueDate: { lt: now },
        },
        select: { id: true, invoiceNumber: true }
      });

      if (pendingOverdueInvoices.length > 0) {
        const overdueIds = pendingOverdueInvoices.map(inv => inv.id);
        
        // Update statuses in DB
        await prisma.invoice.updateMany({
          where: { id: { in: overdueIds } },
          data: { status: 'OVERDUE' },
        });

        // Log notifications for each newly overdue invoice
        for (const inv of pendingOverdueInvoices) {
          await createNotification({
            userId,
            title: 'Invoice Overdue',
            message: `Invoice ${inv.invoiceNumber} is now overdue.`,
            type: 'INVOICE_OVERDUE',
            invoiceId: inv.id,
          });
        }
      }

      // 2. Fetch Notifications
      const notifications = await prisma.notification.findMany({
        where: { userId: userId },
        orderBy: { createdAt: 'desc' },
        take: 50, // Keep it fast, get latest 50
      });

      return res.status(200).json(notifications);
    } catch (error) {
      console.error('Notifications GET error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // --- PATCH: Mark notifications as read ---
  else if (req.method === 'PATCH') {
    try {
      const { notificationId, markAll } = req.body;

      if (markAll) {
        await prisma.notification.updateMany({
          where: { userId: userId, isRead: false },
          data: { isRead: true },
        });
        return res.status(200).json({ message: 'All notifications marked as read.' });
      }

      if (!notificationId) {
        return res.status(400).json({ message: 'Notification ID required.' });
      }

      const updated = await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });

      return res.status(200).json(updated);
    } catch (error) {
      console.error('Notifications PATCH error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['GET', 'PATCH']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
