import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const { invoiceId } = req.query;

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        client: { select: { name: true, company: true } },
        user: {
          select: {
            name: true,
            business: {
              select: { businessName: true, logoUrl: true },
            },
          },
        },
        items: true,
      },
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found.' });
    }

    // Return only safe, public-facing data
    return res.status(200).json({
      invoiceNumber: invoice.invoiceNumber,
      date: invoice.date,
      dueDate: invoice.dueDate,
      status: invoice.status,
      total: invoice.total,
      balanceDue: invoice.balanceDue,
      currency: 'NPR',
      clientName: invoice.client?.company || invoice.client?.name || 'Client',
      businessName: invoice.user?.business?.businessName || 'Business',
      businessLogo: invoice.user?.business?.logoUrl || null,
      itemCount: invoice.items?.length || 0,
    });
  } catch (error) {
    console.error('Share invoice API error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}
