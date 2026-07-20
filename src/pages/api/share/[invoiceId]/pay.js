import prisma from '../../../../lib/prisma';
import { createNotification } from '../../../../lib/notifications';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const { invoiceId } = req.query;
  const { amount, method, referenceNo, proofImageUrl, note } = req.body;

  if (!amount || !method) {
    return res.status(400).json({ message: 'Amount and payment method are required.' });
  }

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found.' });
    }

    // Create the payment record with "pending" status
    const payment = await prisma.payment.create({
      data: {
        amount: parseFloat(amount),
        method,
        referenceNo: referenceNo || null,
        proofImageUrl: proofImageUrl || null,
        status: 'pending',
        note: note || null,
        invoiceId: invoice.id,
      },
    });

    await createNotification({
      userId: invoice.userId, // The merchant user ID
      title: 'Payment Attempted',
      message: `A payment of ${amount} was submitted for Invoice ${invoice.invoiceNumber}.`,
      type: 'PAYMENT_ATTEMPT',
      invoiceId: invoice.id,
      paymentId: payment.id,
    });

    return res.status(200).json({
      message: 'Payment submitted successfully. Awaiting merchant verification.',
      paymentId: payment.id,
    });
  } catch (error) {
    console.error('Submit payment API error:', error);
    return res.status(500).json({ message: 'Internal server error.', details: error.message });
  }
}
