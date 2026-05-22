import prisma from './prisma';

export async function createNotification({ userId, title, message, type, invoiceId = null, paymentId = null }) {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        invoiceId,
        paymentId,
      },
    });
  } catch (error) {
    console.error('Failed to create notification log:', error);
  }
}
