import { verify } from 'jsonwebtoken';
import prisma from '../../lib/prisma';
import { createNotification } from '../../lib/notifications';
const SECRET_KEY = process.env.JWT_SECRET;

export default async function handler(req, res) {
  const { authToken } = req.cookies;

  if (!authToken) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  try {
    const decoded = verify(authToken, SECRET_KEY);
    const userId = decoded.userId;

    // --- GET: List all payments for merchant's invoices or fetch single proof ---
    if (req.method === 'GET') {
      const { paymentId } = req.query;

      // If specific payment requested, return only id and proofImageUrl
      if (paymentId) {
        const payment = await prisma.payment.findFirst({
          where: {
            id: String(paymentId),
            invoice: { userId: userId },
          },
          select: {
            id: true,
            proofImageUrl: true,
          },
        });
        if (!payment) return res.status(404).json({ message: 'Payment not found.' });
        return res.status(200).json(payment);
      }

      // Otherwise fetch list WITHOUT multi-megabyte proofImageUrl
      const payments = await prisma.payment.findMany({
        where: {
          invoice: {
            userId: userId,
          },
        },
        select: {
          id: true,
          amount: true,
          method: true,
          referenceNo: true,
          status: true,
          note: true,
          createdAt: true,
          updatedAt: true,
          invoiceId: true,
          invoice: {
            select: {
              invoiceNumber: true,
              total: true,
              balanceDue: true,
              client: {
                select: {
                  name: true,
                  company: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Check which payments have proof images without transferring the base64 strings
      const paymentIds = payments.map(p => p.id);
      let proofIds = new Set();
      if (paymentIds.length > 0) {
        const paymentsWithProof = await prisma.payment.findMany({
          where: {
            id: { in: paymentIds },
            proofImageUrl: { not: null },
          },
          select: { id: true },
        });
        proofIds = new Set(paymentsWithProof.map(p => p.id));
      }

      const formattedPayments = payments.map(p => ({
        ...p,
        hasProofImage: proofIds.has(p.id),
      }));

      return res.status(200).json(formattedPayments);
    }

    // --- PATCH: Verify or Reject a payment ---
    else if (req.method === 'PATCH') {
      const { paymentId, action, rejectNote } = req.body;

      if (!paymentId || !action) {
        return res.status(400).json({ message: 'Payment ID and action are required.' });
      }

      // Verify that this payment belongs to the current user's invoices
      const payment = await prisma.payment.findFirst({
        where: {
          id: paymentId,
          invoice: {
            userId: userId,
          },
        },
        include: {
          invoice: true,
        },
      });

      if (!payment) {
        return res.status(404).json({ message: 'Payment record not found.' });
      }

      if (payment.status !== 'pending') {
        return res.status(400).json({ message: 'Only pending payments can be verified or rejected.' });
      }

      if (action === 'verify') {
        // Calculate new balance
        const currentBalance = parseFloat(payment.invoice.balanceDue);
        const paymentAmount = parseFloat(payment.amount);
        const newBalance = Math.max(0, currentBalance - paymentAmount);
        const newStatus = newBalance <= 0 ? 'PAID' : 'PARTIALLY_PAID';
        
        const currentAmountPaid = parseFloat(payment.invoice.amountPaid || 0);
        const newAmountPaid = currentAmountPaid + paymentAmount;

        // Update payment and invoice inside a transaction
        const [updatedPayment, updatedInvoice] = await prisma.$transaction([
          prisma.payment.update({
            where: { id: paymentId },
            data: { status: 'verified' },
          }),
          prisma.invoice.update({
            where: { id: payment.invoiceId },
            data: {
              balanceDue: newBalance,
              amountPaid: newAmountPaid,
              status: newStatus,
            },
          }),
        ]);

        await createNotification({
          userId,
          title: 'Payment Verified',
          message: `Payment of ${updatedPayment.amount} for Invoice ${payment.invoice.invoiceNumber} was verified.`,
          type: 'PAYMENT_VERIFIED',
          invoiceId: payment.invoiceId,
          paymentId: updatedPayment.id,
        });

        return res.status(200).json({
          message: 'Payment verified successfully and invoice updated.',
          payment: updatedPayment,
          invoice: updatedInvoice,
        });
      } else if (action === 'reject') {
        const updatedPayment = await prisma.payment.update({
          where: { id: paymentId },
          data: {
            status: 'rejected',
            note: rejectNote || 'Payment verification rejected by merchant.',
          },
        });

        await createNotification({
          userId,
          title: 'Payment Rejected',
          message: `Payment of ${updatedPayment.amount} for Invoice ${payment.invoice.invoiceNumber} was rejected.`,
          type: 'PAYMENT_REJECTED',
          invoiceId: payment.invoiceId,
          paymentId: updatedPayment.id,
        });

        return res.status(200).json({
          message: 'Payment verification rejected.',
          payment: updatedPayment,
        });
      } else {
        return res.status(400).json({ message: 'Invalid action. Must be "verify" or "reject".' });
      }
    }

    else {
      res.setHeader('Allow', ['GET', 'PATCH']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

  } catch (error) {
    console.error('Payments API error:', error);
    return res.status(500).json({ message: 'Internal server error.', details: error.message });
  }
}
